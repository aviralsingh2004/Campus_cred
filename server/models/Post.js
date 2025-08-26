const pool = require('../config/database');

class Post {
  static async findAll(whereConditions = {}) {
    let query = `
      SELECT p.*, 
        u.first_name, u.last_name, u.role as author_role,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count,
        EXISTS(
          SELECT 1 FROM post_likes pl2 
          WHERE pl2.post_id = p.id AND pl2.user_id = $1
        ) as user_has_liked
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
    `;
    
    const conditions = [];
    const values = [whereConditions.current_user_id || null];
    let valueIndex = 2;
    
    if (whereConditions.category && whereConditions.category !== 'all') {
      conditions.push(`p.category = $${valueIndex}`);
      values.push(whereConditions.category);
      valueIndex++;
    }
    
    if (whereConditions.featured !== undefined) {
      conditions.push(`p.featured = $${valueIndex}`);
      values.push(whereConditions.featured);
      valueIndex++;
    }
    
    if (whereConditions.author_id) {
      conditions.push(`p.author_id = $${valueIndex}`);
      values.push(whereConditions.author_id);
      valueIndex++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY p.id, u.first_name, u.last_name, u.role
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id, current_user_id = null) {
    const result = await pool.query(`
      SELECT p.*, 
        u.first_name, u.last_name, u.role as author_role,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count,
        EXISTS(
          SELECT 1 FROM post_likes pl2 
          WHERE pl2.post_id = p.id AND pl2.user_id = $2
        ) as user_has_liked
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.first_name, u.last_name, u.role
    `, [id, current_user_id]);
    
    return result.rows[0];
  }

  static async create(postData) {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      author_id,
      featured = false,
      read_time
    } = postData;
    
    const result = await pool.query(`
      INSERT INTO posts (title, content, excerpt, category, tags, author_id, featured, read_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title, content, excerpt, category, tags, author_id, featured, read_time]);
    
    return result.rows[0];
  }

  static async update(id, postData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;
    
    for (const [key, value] of Object.entries(postData)) {
      if (['title', 'content', 'excerpt', 'category', 'tags', 'featured', 'read_time'].includes(key)) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const result = await pool.query(`
      UPDATE posts SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `, values);
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async toggleLike(post_id, user_id) {
    try {
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if user already liked this post
        const existingLike = await client.query(
          'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
          [post_id, user_id]
        );
        
        let action = '';
        if (existingLike.rows.length > 0) {
          // Unlike - remove the like
          await client.query(
            'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [post_id, user_id]
          );
          action = 'unliked';
        } else {
          // Like - add the like
          await client.query(
            'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
            [post_id, user_id]
          );
          action = 'liked';
        }
        
        // Get updated like count
        const countResult = await client.query(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1',
          [post_id]
        );
        
        await client.query('COMMIT');
        
        return {
          action,
          likes_count: parseInt(countResult.rows[0].count),
          user_has_liked: action === 'liked'
        };
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static async addComment(post_id, user_id, content) {
    const result = await pool.query(`
      INSERT INTO post_comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [post_id, user_id, content]);
    
    return result.rows[0];
  }

  static async getComments(post_id) {
    const result = await pool.query(`
      SELECT pc.*, u.first_name, u.last_name, u.role
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
    `, [post_id]);
    
    return result.rows;
  }
}

module.exports = Post;

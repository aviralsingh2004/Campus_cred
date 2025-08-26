const Post = require('../models/Post');

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const current_user_id = req.user?.id;
    
    const whereConditions = {
      current_user_id
    };
    
    if (category && category !== 'all') {
      whereConditions.category = category;
    }
    
    if (featured !== undefined) {
      whereConditions.featured = featured === 'true';
    }
    
    const posts = await Post.findAll(whereConditions);
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get single post
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const current_user_id = req.user?.id;
    
    const post = await Post.findById(id, current_user_id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured, read_time } = req.body;
    const author_id = req.user.id;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Generate excerpt if not provided
    const postExcerpt = excerpt || content.substring(0, 150) + '...';
    
    // Calculate read time if not provided
    const postReadTime = read_time || `${Math.ceil(content.split(' ').length / 200)} min read`;
    
    const postData = {
      title,
      content,
      excerpt: postExcerpt,
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      author_id,
      featured: featured || false,
      read_time: postReadTime
    };
    
    const post = await Post.create(postData);
    
    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user_id = req.user.id;
    
    // Check if post exists and user owns it (or is admin)
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (existingPost.author_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }
    
    // Handle tags array
    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }
    
    const updatedPost = await Post.update(id, updateData);
    
    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    // Check if post exists and user owns it (or is admin)
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (existingPost.author_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }
    
    await Post.delete(id);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Toggle like on post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;
    
    const result = await Post.toggleLike(postId, user_id);
    
    res.json({
      success: true,
      data: result,
      message: `Post ${result.action} successfully`
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const comment = await Post.addComment(postId, user_id, content.trim());
    
    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Get comments for post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Post.getComments(postId);
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments
};

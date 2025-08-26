const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments
} = require('../controllers/postsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/:postId/comments', getComments);

// Protected user routes
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:postId/like', authenticateToken, toggleLike);
router.post('/:postId/comments', authenticateToken, addComment);

module.exports = router;

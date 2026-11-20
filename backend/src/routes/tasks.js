const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// All task routes require authentication
router.use(authMiddleware);

// @route   GET /api/tasks/stats
router.get('/stats', getStats);

// @route   GET /api/tasks
router.get('/', getTasks);

// @route   GET /api/tasks/:id
router.get('/:id', getTaskById);

// @route   POST /api/tasks
router.post('/', createTask);

// @route   PUT /api/tasks/:id
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;

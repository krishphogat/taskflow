const pool = require('../config/database');

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
  const { status, priority, category_id, search, sort_by = 'created_at', order = 'DESC' } = req.query;

  try {
    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    if (category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }
    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSorts = ['created_at', 'due_date', 'priority', 'title', 'status'];
    const sortColumn = allowedSorts.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY t.${sortColumn} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  const { title, description, status = 'pending', priority = 'medium', due_date, category_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, status, priority, due_date || null, category_id || null, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Task created!', data: result.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { title, description, status, priority, due_date, category_id } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           category_id = COALESCE($6, category_id)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, status, priority, due_date, category_id, req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Task updated!', data: result.rows[0] });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent
       FROM tasks WHERE user_id = $1`,
      [req.user.id]
    );

    const recentTasks = await pool.query(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 ORDER BY t.created_at DESC LIMIT 5`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        stats: stats.rows[0],
        recentTasks: recentTasks.rows,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getStats };

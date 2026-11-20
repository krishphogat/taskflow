const pool = require('../config/database');

// Get all categories for user
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(t.id) as task_count
       FROM categories c
       LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = $1
       WHERE c.user_id = $1
       GROUP BY c.id ORDER BY c.created_at ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  const { name, color = '#6366f1', icon = 'folder' } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, color, icon, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, color, icon, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Category created!', data: result.rows[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const { name, color, icon } = req.body;
  try {
    const result = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name), color = COALESCE($2, color), icon = COALESCE($3, icon)
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, color, icon, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category updated!', data: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

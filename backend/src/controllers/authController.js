const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// In‑memory fallback store for users when the database is unavailable
let inMemoryUsers = [];
let nextUserId = 1;

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// Register – tries DB first, falls back to in‑memory store
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const pool = require('../config/database');
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, avatar_color) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar_color, created_at',
      [name, email, passwordHash, avatarColor]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    return res.status(201).json({ success: true, message: 'Account created successfully!', data: { user, token } });
  } catch (dbError) {
    // Fallback to in‑memory store
    if (inMemoryUsers.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const user = { id: nextUserId++, name, email, password_hash: passwordHash, avatar_color: avatarColor };
    inMemoryUsers.push(user);
    const token = generateToken(user);
    return res.status(201).json({ success: true, message: 'Account created successfully! (in‑memory)', data: { user, token } });
  }
};

// Login – DB first, then in‑memory fallback
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = require('../config/database');
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = generateToken(user);
    const { password_hash, ...userData } = user;
    return res.json({ success: true, message: 'Login successful!', data: { user: userData, token } });
  } catch (dbError) {
    const user = inMemoryUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = generateToken(user);
    const { password_hash, ...userData } = user;
    return res.json({ success: true, message: 'Login successful! (in‑memory)', data: { user: userData, token } });
  }
};

// Get profile – DB first, then in‑memory fallback
const getProfile = async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query('SELECT id, name, email, avatar_color, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (dbError) {
    const user = inMemoryUsers.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password_hash, ...profile } = user;
    return res.json({ success: true, data: profile });
  }
};

module.exports = { register, login, getProfile };

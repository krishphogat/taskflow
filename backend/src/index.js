const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 TaskFlow API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// Initialize database and start server
const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection verified');
    
    // Run schema creation
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(__dirname, 'config/schema.sql'), 'utf8');
    await client.query(schema);
    client.release();
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.warn('⚠️  Database not available:', error.message);
    console.warn('⚠️  Starting server without DB - connect a PostgreSQL database to use full features');
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 TaskFlow Backend running on http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();

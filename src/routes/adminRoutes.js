// src/routes/adminRoutes.js
const express = require('express');
const { executeQuery, getTableInfo } = require('../controllers/adminController');

const router = express.Router();

// Serve the admin interface
router.get('/', (req, res) => {
  res.sendFile('admin.html', { root: 'public' });
});

// Execute SQL query
router.post('/execute', executeQuery);

// Get table information
router.get('/tables', getTableInfo);

module.exports = router;
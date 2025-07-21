// src/controllers/adminController.js
const pool = require('../config/database');

const executeQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Basic security - prevent dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE'];
    const upperQuery = query.toUpperCase();
    
    const isDangerous = dangerousKeywords.some(keyword => 
      upperQuery.includes(keyword)
    );

    if (isDangerous) {
      return res.status(403).json({
        success: false,
        error: 'Only SELECT queries are allowed for security reasons'
      });
    }

    const result = await pool.query(query);
    
    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields ? result.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      })) : [],
      query: query
    });

  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getTableInfo = async (req, res) => {
  try {
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    
    res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
    
  } catch (error) {
    console.error('Table info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  executeQuery,
  getTableInfo
};
const Offer = require('./Offer');
const pool = require('../config/database'); // import the shared pool

// Database initialization script
const initDatabase = async () => {
  try {
    await pool.query(Offer.createTableSQL);
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

module.exports = {
  Offer,
  initDatabase
};

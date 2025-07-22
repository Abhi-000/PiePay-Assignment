const Offer = require('./Offer');

// Database initialization script
const initDatabase = async (client) => {
  try {
    await client.query(Offer.createTableSQL);
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

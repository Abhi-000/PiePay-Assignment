const { Pool } = require('pg');
console.log("database url:  "+ process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;

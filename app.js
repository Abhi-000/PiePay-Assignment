require('dotenv').config()
const express = require('express');
const cors = require('cors');
const offerRoutes = require('./src/routes/offerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const {initDatabase} = require('./src/models/index');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api', offerRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});
app.listen(PORT, () => {
  //initDatabase();
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;

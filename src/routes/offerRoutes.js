// src/routes/offerRoutes.js
const express = require('express');
const { createOffers, getHighestDiscount } = require('../controllers/offerController');

const router = express.Router();

// POST /api/offers/offer - Create new offers
router.post('/offer', createOffers);

// GET /api/offers/highest-discount - Get highest discount offer
router.get('/highest-discount', getHighestDiscount);

module.exports = router;
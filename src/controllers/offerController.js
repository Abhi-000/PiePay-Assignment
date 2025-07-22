// src/controllers/offerController.js
const pool = require('../config/database');
const OfferParser = require('../services/offerParser');
const { calculateDiscount } = require('../utils/discountCalculator');
const {shouldApplyOffer } = require('../utils/offerValidation');

const createOffers = async (req, res) => {
  try {
    if (!req.body.flipkartOfferApiResponse) {
      return res.status(400).json({ error: 'flipkartOfferApiResponse is required' });
    }
    
    // Parse offers from Flipkart response
    const parsedOffers = OfferParser.parseFlipkartResponse(req.body.flipkartOfferApiResponse);

    const validOffers = parsedOffers.filter(offer => offer !== null);

    let newOffersCreated = 0;
    
    // Store each offer in database
    for (const offer of validOffers) {
      // Skip offers without adjustment_id
      if (!offer.adjustmentId) {
        console.warn('Skipping offer without adjustment_id:', offer.title);
        continue;
      }
      
      const insertQuery = `
        INSERT INTO offers (
          adjustment_id, bank_name, title, discount_type, discount_value, 
          min_amount, max_discount, payment_instruments, emi_months, adjustment_type, adjustment_sub_type, offer_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (adjustment_id) DO NOTHING
        RETURNING id
      `;
      
      const result = await pool.query(insertQuery, [
        offer.adjustmentId,
        offer.bankName,
        offer.title,
        offer.discountType,
        offer.discountValue,
        offer.minAmount,
        offer.maxDiscount,
        offer.paymentInstruments,
        offer.emiMonths,
        offer.adjustmentType,
        offer.adjustmentSubType,
        JSON.stringify(offer.originalData)
      ]);
      
      if (result.rows.length > 0) {
        newOffersCreated++;
      }
    }
    
    res.json({
      noOfOffersIdentified: parsedOffers.length,
      noOfNewOffersCreated: newOffersCreated
    });
    
  } catch (error) {
    console.error('Error in createOffers controller:', error);
    res.status(500).json({ error: error.message });
  }
};

const getHighestDiscount = async (req, res) => {
  try {
    const { amountToPay, bankName, paymentInstrument } = req.query;
    
    // Validation
    if (!amountToPay || !bankName) {
      return res.status(400).json({ 
        error: 'amountToPay and bankName are required query parameters' 
      });
    }
    
    const amount = parseFloat(amountToPay);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'amountToPay must be a valid positive number' 
      });
    }
    
    // Build query with payment instrument filter
let query = `
  SELECT * FROM offers 
  WHERE ($1 = ANY(banks) OR array_length(banks, 1) IS NULL)
  AND (min_amount IS NULL OR min_amount <= $2)
`;
    
    const queryParams = [bankName.toUpperCase(), amount];
    
    // Add payment instrument filter if provided
    if (paymentInstrument) {
      query += ` AND ($${queryParams.length + 1} = ANY(payment_instruments) OR array_length(payment_instruments, 1) IS NULL)`;
      queryParams.push(paymentInstrument.toUpperCase());
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    const applicableOffers = result.rows;
    
    if (applicableOffers.length === 0) {
      const message = paymentInstrument 
        ? `No offers found for bank ${bankName} with payment instrument ${paymentInstrument}`
        : `No offers found for bank ${bankName}`;
      
      return res.json({
        highestDiscountAmount: 0,
        message
      });
    }
    
    // Calculate discount for each applicable offer
    let highestDiscount = 0;
    let bestOffer = null;
    
    for (const offer of applicableOffers) {
  if (!shouldApplyOffer(offer, amount)) {
    continue; // Skip this offer
  }

          const calculatedDiscount = calculateDiscount(offer, amount);
      
      if (calculatedDiscount > highestDiscount) {
        highestDiscount = calculatedDiscount;
        bestOffer = offer;
      }
    }
    
    res.json({
      highestDiscountAmount: Math.round(highestDiscount),
      bestOffer: bestOffer ? {
        title: bestOffer.title,
        adjustmentId: bestOffer.adjustment_id,
        discountType: bestOffer.discount_type,
        discountValue: bestOffer.discount_value,
        paymentInstruments: bestOffer.payment_instruments
      } : null
    });
    
  } catch (error) {
    console.error('Error in getHighestDiscount controller:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOffers,
  getHighestDiscount
};
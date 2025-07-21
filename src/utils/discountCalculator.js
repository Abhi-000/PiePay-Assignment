/**
 * Calculate discount amount for a given offer and payment amount
 * @param {Object} offer - Offer object from database
 * @param {number} amount - Amount to pay
 * @returns {number} Calculated discount amount
 */
function calculateDiscount(offer, amount) {
  try {
    let discount = 0;
    
    // Add null checks for edge cases
    if (!offer || !amount || amount <= 0) {
      return 0;
    }
    
    // Check minimum amount requirement
    if (offer.min_amount && amount < offer.min_amount) {
      return 0;
    }
    
    if (offer.discount_type === 'PERCENTAGE') {
      // Calculate percentage discount
      discount = (amount * offer.discount_value) / 100;
      
      // Apply maximum discount cap if specified
      if (offer.max_discount && discount > offer.max_discount) {
        discount = offer.max_discount;
      }
      
    } else if (offer.discount_type === 'FLAT') {
      // Flat discount
      discount = offer.discount_value;
      
      // Don't give discount higher than the amount itself
      if (discount > amount) {
        discount = amount;
      }
    }
    
    return discount;
    
  } catch (error) {
    console.error('Error calculating discount:', error);
    return 0;
  }
}

module.exports = { calculateDiscount };
// src/services/offerParser.js
const {extractDiscountFromSummary } = require('../utils/discountExtractor');

class OfferParser {
  
  /**
   * Parse Flipkart API response and extract offers
   * @param {Object} flipkartResponse - The complete Flipkart offers API response
   * @returns {Array} Array of parsed offer objects (deduplicated)
   */
  static parseFlipkartResponse(flipkartResponse) {
    const offerMap = new Map(); // Use Map to deduplicate by adjustment_id
    
    try {
      // Extract offers from offer_banners section
      if (flipkartResponse.offer_banners && Array.isArray(flipkartResponse.offer_banners)) {
        for (const banner of flipkartResponse.offer_banners) {
          const parsedOffer = this.parseSingleOffer(banner);
          if (parsedOffer && parsedOffer.adjustmentId) {
            offerMap.set(parsedOffer.adjustmentId, parsedOffer);
          }
        }
      }
      
      // Extract offers from offer_sections
      // This will merge/override with any existing offers from banners
      if (flipkartResponse.offer_sections) {
        for (const sectionKey in flipkartResponse.offer_sections) {
          const section = flipkartResponse.offer_sections[sectionKey];
          if (section.offers && Array.isArray(section.offers)) {
            for (const offer of section.offers) {
              const parsedOffer = this.parseSingleOffer(offer);
              if (parsedOffer && parsedOffer.adjustmentId) {
                // If offer already exists, merge the data to get the most complete information
                if (offerMap.has(parsedOffer.adjustmentId)) {
                  const existingOffer = offerMap.get(parsedOffer.adjustmentId);
                  const mergedOffer = this.mergeOfferData(existingOffer, parsedOffer);
                  offerMap.set(parsedOffer.adjustmentId, mergedOffer);
                } else {
                  offerMap.set(parsedOffer.adjustmentId, parsedOffer);
                }
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error parsing Flipkart response:', error);
      throw new Error('Failed to parse Flipkart offers response');
    }
    
    // Convert Map values back to array
    return Array.from(offerMap.values());
  }
  
  /**
   * Merge two offer objects, preferring non-null/non-empty values
   * @param {Object} existing - Existing offer object
   * @param {Object} newOffer - New offer object to merge
   * @returns {Object} Merged offer object
   */
  static mergeOfferData(existing, newOffer) {
    return {
      ...existing,
      // Prefer non-null adjustment_type from either source
      adjustmentType: newOffer.adjustmentType || existing.adjustmentType,
      // Use the more complete payment instruments array
      paymentInstruments: newOffer.paymentInstruments.length > existing.paymentInstruments.length 
        ? newOffer.paymentInstruments 
        : existing.paymentInstruments,
      // Keep the most recent original data (usually from offer_sections has more fields)
      originalData: newOffer.originalData.adjustment_type ? newOffer.originalData : existing.originalData
    };
  }
  
  /**
   * Parse a single offer object from Flipkart
   * @param {Object} offerData - Single offer object from Flipkart
   * @returns {Object|null} Parsed offer object or null if parsing fails
   */
  static parseSingleOffer(offerData) {
    try {
      // Extract bank names from contributors.banks array
      const bankNames = offerData.contributors?.banks || [];
      
      // If no bank specified, set as 'GENERAL' for UPI offers, etc.
      const primaryBank = bankNames.length > 0 ? bankNames[0] : 'GENERAL';
      
      // Extract payment instruments
      const paymentInstruments = offerData.contributors?.payment_instrument || [];
      
      // Extract EMI months and convert to integers
      const emiMonths = (offerData.contributors?.emi_months || [])
        .map(month => parseInt(month))
        .filter(month => !isNaN(month));
      
      // Extract card networks
      const cardNetworks = offerData.contributors?.card_networks || [];
      
      // Parse discount information from summary text
      const discountInfo = extractDiscountFromSummary(offerData.summary);
      
      return {
        bankName: bankNames,
        title: offerData.summary,
        discountType: discountInfo.type,
        discountValue: discountInfo.value,
        minAmount: discountInfo.minAmount,
        maxDiscount: discountInfo.maxDiscount,
        paymentInstruments: paymentInstruments,
        emiMonths: emiMonths,
        cardNetworks: cardNetworks,
        originalData: offerData, // Store original data for reference
        adjustmentId: offerData.adjustment_id,
        adjustmentType: offerData.adjustment_type || null,
        adjustmentSubType: offerData.adjustment_sub_type || null
      };
      
    } catch (error) {
      console.error('Error parsing single offer:', error, offerData);
      return null;
    }
  }
  
  /**
   * Extract discount information from offer summary text
   * @param {string} summary - Offer summary text
   * @returns {Object} Discount information object
   */

}

module.exports = OfferParser;
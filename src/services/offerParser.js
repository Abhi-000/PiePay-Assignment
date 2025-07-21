// src/services/offerParser.js

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
      
      // Extract offers from offer_sections (like PBO section)
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
      const discountInfo = this.extractDiscountFromSummary(offerData.summary);
      
      return {
        bankName: primaryBank,
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
  static extractDiscountFromSummary(summary) {
    const result = {
      type: 'FLAT',
      value: 0,
      minAmount: null,
      maxDiscount: null
    };
    
    if (!summary) return result;
    
    try {
      // Extract percentage discount (e.g., "5% cashback")
      const percentageMatch = summary.match(/(\d+)%/);
      if (percentageMatch) {
        result.type = 'PERCENTAGE';
        result.value = parseInt(percentageMatch[1]);
      }
      
      // Extract flat discount amount (e.g., "Flat ₹10", "₹500", "upto ₹4,000")
      const flatAmountMatch = summary.match(/₹\s*(\d+(?:,\d+)*)/g);
      if (flatAmountMatch) {
        // Convert comma-separated numbers to integers
        const amounts = flatAmountMatch.map(amount => {
          return parseInt(amount.replace(/[₹\s,]/g, ''));
        });
        
        // If percentage discount, the first amount might be max discount
        if (result.type === 'PERCENTAGE' && amounts.length > 0) {
          result.maxDiscount = amounts[0];
        }
        // If flat discount, take the first amount as discount value
        else if (result.type === 'FLAT' && amounts.length > 0) {
          result.value = amounts[0];
        }
      }
      
      // Extract minimum amount (e.g., "Min Order Value ₹500", "above ₹2999")
      const minAmountMatch = summary.match(/(?:Min Order Value|above|minimum)\s*₹\s*(\d+(?:,\d+)*)/i);
      if (minAmountMatch) {
        result.minAmount = parseInt(minAmountMatch[1].replace(/,/g, ''));
      }
      
      // Extract maximum discount for percentage offers
      const maxDiscountMatch = summary.match(/(?:upto|up to)\s*₹\s*(\d+(?:,\d+)*)/i);
      if (maxDiscountMatch) {
        result.maxDiscount = parseInt(maxDiscountMatch[1].replace(/,/g, ''));
      }
      
    } catch (error) {
      console.error('Error extracting discount from summary:', error);
    }
    
    return result;
  }
  
  /**
   * Validate parsed offer data
   * @param {Object} offer - Parsed offer object
   * @returns {boolean} True if offer is valid
   */
  static validateOffer(offer) {
    return offer && 
           offer.bankName && 
           offer.title && 
           offer.discountType && 
           typeof offer.discountValue === 'number' &&
           offer.discountValue > 0;
  }
}

module.exports = OfferParser;
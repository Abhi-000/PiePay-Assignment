  function extractDiscountFromSummary(summary) {
  const result = {
    type: 'FLAT',
    value: 0,
    minAmount: null,
    maxDiscount: null
  };
  
  if (!summary) return result;
  
  try {
    // Extract percentage discount
    const percentageMatch = summary.match(/(\d+)%/);
    if (percentageMatch) {
      result.type = 'PERCENTAGE';
      result.value = parseInt(percentageMatch[1]);
    }
    
    // Extract flat discount amount
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
    
    // Fixed: Extract minimum amount with more specific regex
    // Look for specific patterns that indicate minimum transaction value
     const minAmountMatch = summary.match(/(?:Min\.?\s*(?:Order|Txn|TxnValue|Transaction|Product)\s*Value|minimum\s*order|cart\s*value\s*above)\s*:?\s*₹\s*(\d+(?:,\d+)*)/i);
    if (minAmountMatch) {
      result.minAmount = parseInt(minAmountMatch[1].replace(/,/g, ''));
    }
    

    
    // Extract maximum discount for percentage offers
    const maxDiscountMatch = summary.match(/(?:upto|up to)\s*₹\s*(\d+(?:,\d+)*)/i);
    if (maxDiscountMatch) {
      result.maxDiscount = parseInt(maxDiscountMatch[1].replace(/,/g, ''));
    }
    
    // Check for EMI benefits
    if (summary.toLowerCase().includes('no cost emi')) {
      result.type = 'EMI_BENEFIT';
      result.value = 0; // No direct discount value for EMI benefits
    }

  } catch (error) {
    console.error('Error extracting discount from summary:', error);
  }
  
  return result;
}
module.exports = { extractDiscountFromSummary };
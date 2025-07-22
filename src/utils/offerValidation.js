function shouldApplyOffer(offer, amount){
  const { discount_type, discount_value, min_amount, max_discount } = offer;
  
  // Both min_amount and max_discount are null
  if (!min_amount && !max_discount) {
    if (discount_type === 'FLAT' || discount_type === 'PERCENTAGE') {
      return false; // ignore unconstrained flat/percentage offers
    }
    // EMI_BENEFIT offers are okay without constraints
    if (discount_type === 'EMI_BENEFIT') {
      return true;
    }
  }
  
  // Only min_amount is null (max_discount exists)
  if (!min_amount && max_discount) {
    if (discount_type === 'FLAT') {
      return false; // ignore flat offers without minimum amount
    }
    // PERCENTAGE and EMI_BENEFIT are okay with just max_discount
    if (discount_type === 'PERCENTAGE' || discount_type === 'EMI_BENEFIT') {
      return true;
    }
  }
  
  // Only max_discount is null (min_amount exists) - all types are okay
  if (min_amount && !max_discount) {
    // Additional check: ensure amount meets minimum requirement
    return amount >= min_amount;
  }
  
  // Both constraints exist - all types are okay
  if (min_amount && max_discount) {
    return amount >= min_amount;
  }
  
  // Additional validations
  if (discount_type === 'PERCENTAGE' && discount_value > 100) {
    return false; // ignore unrealistic percentage (>100%)
  }
  
  if (discount_type === 'FLAT' && min_amount && discount_value > min_amount) {
    return false; // ignore if discount > minimum amount required
  }
  
  return true; // Default: apply the offer
};

module.exports = { shouldApplyOffer };
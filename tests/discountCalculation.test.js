const { calculateDiscount } = require('../src/utils/discountCalculator');

describe('Discount Calculation Tests', () => {
  
  describe('Percentage Discounts', () => {
    test('should calculate 5% discount without cap', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: null,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 1000);
      expect(discount).toBe(50); // 5% of 1000
    });

    test('should apply max discount cap for percentage offers', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: 500,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 20000); // 5% of 20000 = 1000, but capped at 500
      expect(discount).toBe(500);
    });

    test('should not apply cap if discount is below max', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: 500,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 2000); // 5% of 2000 = 100, below cap
      expect(discount).toBe(100);
    });
  });

  describe('Flat Discounts', () => {
    test('should give flat discount amount', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 100,
        max_discount: null,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 1000);
      expect(discount).toBe(100);
    });

    test('should not exceed payment amount for flat discount', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 1000,
        max_discount: null,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 500); // Discount shouldn't exceed payment
      expect(discount).toBe(500);
    });
  });

  describe('Minimum Amount Requirements', () => {
    test('should return 0 if payment below minimum for percentage', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: null,
        min_amount: 1000
      };
      
      const discount = calculateDiscount(offer, 500); // Below minimum
      expect(discount).toBe(0);
    });

    test('should return 0 if payment below minimum for flat', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 100,
        max_discount: null,
        min_amount: 500
      };
      
      const discount = calculateDiscount(offer, 300); // Below minimum
      expect(discount).toBe(0);
    });

    test('should calculate discount if payment meets minimum', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 100,
        max_discount: null,
        min_amount: 500
      };
      
      const discount = calculateDiscount(offer, 500); // Meets minimum exactly
      expect(discount).toBe(100);
    });
  });

  describe('Real-world Flipkart Offer Examples', () => {
    test('Paytm UPI offer - Flat ₹10 with Min ₹500', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 10,
        max_discount: null,
        min_amount: 500
      };
      
      expect(calculateDiscount(offer, 400)).toBe(0); // Below minimum
      expect(calculateDiscount(offer, 500)).toBe(10); // Meets minimum
      expect(calculateDiscount(offer, 1000)).toBe(10); // Above minimum
    });

    test('Axis Bank Credit Card - 5% upto ₹4000', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: 4000,
        min_amount: null
      };
      
      expect(calculateDiscount(offer, 10000)).toBe(500); // 5% of 10000
      expect(calculateDiscount(offer, 100000)).toBe(4000); // Capped at 4000
    });

    test('Axis Bank Debit Card - 5% upto ₹750', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: 750,
        min_amount: null
      };
      
      expect(calculateDiscount(offer, 5000)).toBe(250); // 5% of 5000
      expect(calculateDiscount(offer, 20000)).toBe(750); // Capped at 750
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid discount type gracefully', () => {
      const offer = {
        discount_type: 'INVALID_TYPE',
        discount_value: 100,
        max_discount: null,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 1000);
      expect(discount).toBe(0);
    });

    test('should handle zero amount', () => {
      const offer = {
        discount_type: 'PERCENTAGE',
        discount_value: 5,
        max_discount: null,
        min_amount: null
      };
      
      const discount = calculateDiscount(offer, 0);
      expect(discount).toBe(0);
    });

    test('should handle null/undefined values', () => {
      const offer = {
        discount_type: 'FLAT',
        discount_value: 100,
        max_discount: null,
        min_amount: null
      };
      
      expect(calculateDiscount(offer, null)).toBe(0);
      expect(calculateDiscount(null, 1000)).toBe(0);
    });
  });
});
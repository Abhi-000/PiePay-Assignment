const { extractDiscountFromSummary } = require('../src/utils/discountExtractor'); // Adjust path as needed

describe('Discount Extraction Tests', () => {

  describe('Percentage Discount Extraction', () => {
    test('should extract simple percentage discount', () => {
      const summary = "Get 5% discount on your order";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(5);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should extract percentage with max discount (upto)', () => {
      const summary = "Get 10% discount upto ₹500";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(10);
      expect(result.maxDiscount).toBe(500);
      expect(result.minAmount).toBeNull();
    });

    test('should extract percentage with max discount (up to)', () => {
      const summary = "Enjoy 15% off up to ₹2,000";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(15);
      expect(result.maxDiscount).toBe(2000);
      expect(result.minAmount).toBeNull();
    });

    test('should handle percentage with comma-separated max discount', () => {
      const summary = "Save 8% upto ₹1,500 on electronics";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(8);
      expect(result.maxDiscount).toBe(1500);
    });
  });

  describe('Flat Discount Extraction', () => {
    test('should extract flat discount amount', () => {
      const summary = "Get ₹100 off on your purchase";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(100);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should extract flat discount with comma-separated amount', () => {
      const summary = "Save ₹2,500 on home appliances";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(2500);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should extract flat discount with spaces in amount', () => {
      const summary = "Instant discount of ₹ 750";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(750);
    });
  });

  describe('Minimum Amount Extraction', () => {
    test('should extract minimum order value', () => {
      const summary = "Get ₹50 off. Min Order Value: ₹500";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(50);
      expect(result.minAmount).toBe(500);
    });

    test('should extract minimum transaction value', () => {
      const summary = "5% discount. Min Transaction Value: ₹1,000";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(5);
      expect(result.minAmount).toBe(1000);
    });

    test('should extract minimum with various formats', () => {
      const testCases = [
        { summary: "₹100 off. Min.Order Value: ₹2,500", expected: 2500 },
        { summary: "Discount available. Min Txn Value: ₹800", expected: 800 },
        { summary: "Save money. Min TxnValue: ₹1,200", expected: 1200 },
        { summary: "Great offer. minimum order: ₹300", expected: 300 },
        { summary: "Best deal. cart value above: ₹5,000", expected: 5000 }
      ];

      testCases.forEach(({ summary, expected }) => {
        const result = extractDiscountFromSummary(summary);
        expect(result.minAmount).toBe(expected);
      });
    });

    test('should handle minimum product value', () => {
      const summary = "Get 10% off. Min Product Value: ₹750";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.minAmount).toBe(750);
    });
  });

  describe('EMI Benefits', () => {
    test('should detect no cost EMI benefit', () => {
      const summary = "No Cost EMI available for 6 months";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('EMI_BENEFIT');
      expect(result.value).toBe(0);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should detect EMI with case variations', () => {
      const summary = "Enjoy NO COST EMI on select cards";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('EMI_BENEFIT');
      expect(result.value).toBe(0);
    });
  });

  describe('Complex Real-world Examples', () => {
    test('should handle Flipkart-style offer: percentage with min and max', () => {
      const summary = "Get 5% instant discount upto ₹4,000. Min Order Value: ₹2,000";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(5);
      expect(result.maxDiscount).toBe(4000);
      expect(result.minAmount).toBe(2000);
    });

    test('should handle bank offer format', () => {
      const summary = "AXIS Bank Card: 10% off upto ₹750. Min Txn Value: ₹5,000";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(10);
      expect(result.maxDiscount).toBe(750);
      expect(result.minAmount).toBe(5000);
    });

    test('should handle flat discount with minimum', () => {
      const summary = "Flat ₹200 off on fashion. minimum order: ₹1,500";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(200);
      expect(result.minAmount).toBe(1500);
    });

    test('should handle UPI offer format', () => {
      const summary = "UPI: Get ₹25 cashback. Min Order Value: ₹500";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(25);
      expect(result.minAmount).toBe(500);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null summary', () => {
      const result = extractDiscountFromSummary(null);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(0);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should handle undefined summary', () => {
      const result = extractDiscountFromSummary(undefined);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(0);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should handle empty string', () => {
      const result = extractDiscountFromSummary("");
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(0);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should handle summary with no discount information', () => {
      const summary = "This is just a regular product description";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(0);
      expect(result.minAmount).toBeNull();
      expect(result.maxDiscount).toBeNull();
    });

    test('should handle malformed currency amounts', () => {
      const summary = "Get discount of ₹abc on orders";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(0); // Should handle NaN gracefully
    });

    test('should handle multiple percentage values (takes first)', () => {
      const summary = "Get 5% off, was 10% earlier";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('PERCENTAGE');
      expect(result.value).toBe(5); // Should take first match
    });

    test('should handle multiple currency amounts correctly', () => {
      const summary = "Save ₹100 off, upto ₹500 maximum discount";
      const result = extractDiscountFromSummary(summary);
      
      expect(result.type).toBe('FLAT');
      expect(result.value).toBe(100); // First amount as flat discount
    });
  });

  describe('Regex Pattern Validation', () => {
    test('should match percentage patterns correctly', () => {
      const testCases = [
        "5%", "10%", "15%", "100%"
      ];
      
      testCases.forEach(pattern => {
        const summary = `Get ${pattern} discount`;
        const result = extractDiscountFromSummary(summary);
        expect(result.type).toBe('PERCENTAGE');
        expect(result.value).toBe(parseInt(pattern.replace('%', '')));
      });
    });

    test('should match currency patterns with variations', () => {
      const testCases = [
        { pattern: "₹100", expected: 100 },
        { pattern: "₹ 200", expected: 200 },
        { pattern: "₹1,500", expected: 1500 },
        { pattern: "₹ 2,500", expected: 2500 },
        { pattern: "₹10,000", expected: 10000 }
      ];
      
      testCases.forEach(({ pattern, expected }) => {
        const summary = `Get ${pattern} off`;
        const result = extractDiscountFromSummary(summary);
        expect(result.type).toBe('FLAT');
        expect(result.value).toBe(expected);
      });
    });

    test('should match minimum amount patterns case-insensitively', () => {
      const testCases = [
        "Min Order Value: ₹500",
        "MIN ORDER VALUE: ₹500", 
        "min order value: ₹500",
        "Min.Order Value: ₹500",
        "minimum order: ₹500",
        "MINIMUM ORDER: ₹500"
      ];
      
      testCases.forEach(pattern => {
        const result = extractDiscountFromSummary(pattern);
        expect(result.minAmount).toBe(500);
      });
    });
  });
});
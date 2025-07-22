const OfferSchema = {
  tableName: 'offers',
  columns: {
    id: {
      type: 'SERIAL',
      primaryKey: true,
      nullable: false,
      description: 'Unique identifier for each offer'
    },
    bank_name: {
      type: 'TEXT[]',
      nullable: false,
      description: 'Array of supported bank names (e.g., ["AXIS", "HDFC", "SBI"])'
    },
    title: {
      type: 'TEXT',
      nullable: true,
      description: 'Display title of the offer'
    },
    discount_type: {
      type: 'VARCHAR(50)',
      nullable: true,
      description: 'Type of discount (e.g., "percentage", "fixed", "cashback")'
    },
    discount_value: {
      type: 'INTEGER',
      nullable: false,
      description: 'Discount value (percentage or fixed amount in paise/cents)'
    },
    min_amount: {
      type: 'INTEGER',
      nullable: true,
      description: 'Minimum purchase amount required (in paise/cents)'
    },
    max_discount: {
      type: 'INTEGER',
      nullable: true,
      description: 'Maximum discount cap (in paise/cents)'
    },
    payment_instruments: {
      type: 'TEXT[]',
      nullable: true,
      description: 'Supported payment methods (e.g., ["CREDIT", "EMI_OPTIONS"])'
    },
    offer_data: {
      type: 'JSONB',
      nullable: true,
      description: 'Original offer data from Flipkart API for reference'
    },
    created_at: {
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Record creation timestamp'
    },
    adjustment_id: {
      type: 'VARCHAR(100)',
      nullable: true,
      unique: true,
      description: 'Flipkart internal adjustment identifier (unique constraint)'
    },
    adjustment_type: {
      type: 'VARCHAR(50)',
      nullable: true,
      description: 'Type of price adjustment from Flipkart'
    },
    adjustment_sub_type: {
      type: 'VARCHAR(50)',
      nullable: true,
      description: 'Sub-category of adjustment type'
    },
    emi_months: {
      type: 'INTEGER[]',
      nullable: true,
      description: 'Available EMI tenure options in months'
    }
  }
};

// SQL CREATE TABLE statement with all constraints and indexes
const createTableSQL = `
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    bank_name TEXT[] NOT NULL,
    title TEXT,
    discount_type VARCHAR(50),
    discount_value INTEGER NOT NULL,
    min_amount INTEGER,
    max_discount INTEGER,
    payment_instruments TEXT[],
    offer_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adjustment_id VARCHAR(100) UNIQUE,
    adjustment_type VARCHAR(50),
    adjustment_sub_type VARCHAR(50),
    emi_months INTEGER[]
);

-- Create indexes for faster queries (based on existing schema)
CREATE INDEX IF NOT EXISTS idx_adjustment_id ON offers USING btree (adjustment_id);
CREATE INDEX IF NOT EXISTS idx_payment_instruments ON offers USING gin (payment_instruments);
CREATE INDEX IF NOT EXISTS idx_bank_name ON offers USING btree (bank_name);

-- Additional performance indexes (optional)
CREATE INDEX IF NOT EXISTS idx_discount_value ON offers (discount_value);
CREATE INDEX IF NOT EXISTS idx_min_amount ON offers (min_amount);
CREATE INDEX IF NOT EXISTS idx_created_at ON offers (created_at);
`;

// Database constraints and indexes (based on actual schema)
const constraints = {
  primaryKey: 'id',
  unique: ['adjustment_id'],
  notNull: ['id', 'bank_name', 'discount_value'],
  indexes: {
    'idx_adjustment_id': 'btree (adjustment_id)',
    'idx_payment_instruments': 'gin (payment_instruments)',
    'idx_bank_name': 'btree (bank_name)',
    'idx_discount_value': 'btree (discount_value)',
    'idx_min_amount': 'btree (min_amount)',
    'idx_created_at': 'btree (created_at)'
  }
};
module.exports = {
  OfferSchema,
  createTableSQL,
  constraints
};


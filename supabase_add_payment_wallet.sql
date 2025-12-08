-- Add payment_wallet column to ebooks table
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS payment_wallet TEXT;

-- Set default value for existing records (use seller address as fallback)
UPDATE ebooks SET payment_wallet = seller WHERE payment_wallet IS NULL;

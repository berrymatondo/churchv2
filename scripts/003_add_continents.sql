-- Create continents table and update countries table

-- Create continents table
CREATE TABLE IF NOT EXISTS continents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the 5 continents
INSERT INTO continents (nom) VALUES 
    ('Afrique'),
    ('Asie'),
    ('Amérique'),
    ('Europe'),
    ('Océanie')
ON CONFLICT (nom) DO NOTHING;

-- Add continent_id column to pays table
ALTER TABLE pays ADD COLUMN IF NOT EXISTS continent_id INTEGER;

-- Add foreign key constraint
ALTER TABLE pays ADD CONSTRAINT fk_pays_continent 
    FOREIGN KEY (continent_id) REFERENCES continents(id);

-- Update existing countries with default continent (you may want to adjust these)
UPDATE pays SET continent_id = (SELECT id FROM continents WHERE nom = 'Europe') 
WHERE continent_id IS NULL;

-- Make continent_id NOT NULL after setting default values
ALTER TABLE pays ALTER COLUMN continent_id SET NOT NULL;

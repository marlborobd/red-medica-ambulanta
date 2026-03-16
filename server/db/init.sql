CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'sofer' CHECK (role IN ('sofer','dispecer','admin')),
  phone VARCHAR(20),
  license_number VARCHAR(50),
  vehicle_plate VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tariffs (
  id SERIAL PRIMARY KEY,
  price_per_km DECIMAL(6,2) DEFAULT 5.00,
  surcharge_urgenta DECIMAL(5,2) DEFAULT 30.00,
  surcharge_nocturna DECIMAL(5,2) DEFAULT 20.00,
  surcharge_aparatura DECIMAL(5,2) DEFAULT 50.00,
  valid_from TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  trip_number VARCHAR(20) UNIQUE,
  patient_name VARCHAR(100) NOT NULL,
  patient_age INTEGER,
  patient_cnp VARCHAR(20),
  patient_phone VARCHAR(20),
  diagnosis TEXT,
  pickup_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,7),
  pickup_lng DECIMAL(10,7),
  destination_lat DECIMAL(10,7),
  destination_lng DECIMAL(10,7),
  distance_km DECIMAL(8,2),
  duration_min INTEGER,
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  trip_type VARCHAR(20) DEFAULT 'standard' CHECK (trip_type IN ('standard','urgenta','nocturna','aparatura')),
  price_per_km DECIMAL(6,2),
  surcharge_pct DECIMAL(5,2) DEFAULT 0,
  total_cost DECIMAL(8,2),
  driver_id INTEGER REFERENCES users(id),
  assigned_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'planificata' CHECK (status IN ('planificata','in_desfasurare','finalizata','anulata')),
  notes TEXT,
  signature_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_documents (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  pdf_url TEXT,
  pdf_type VARCHAR(20) DEFAULT 'foaie_parcurs',
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  liters DECIMAL(6,2),
  price_per_liter DECIMAL(5,2),
  fuel_cost DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

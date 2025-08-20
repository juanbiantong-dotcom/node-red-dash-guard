-- IoT Monitoring Database Setup
-- Run this script in your Supabase SQL Editor

-- Create table for IoT devices
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR(50) UNIQUE NOT NULL,
  device_name VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for sensor data
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(7,2),
  battery_level INTEGER,
  signal_strength INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB,
  FOREIGN KEY (device_id) REFERENCES iot_devices(device_id) ON DELETE CASCADE
);

-- Create table for device alerts
CREATE TABLE IF NOT EXISTS device_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (device_id) REFERENCES iot_devices(device_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_alerts_device_id ON device_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_device_alerts_created_at ON device_alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allows all operations)
CREATE POLICY "Allow all operations for authenticated users" ON iot_devices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON sensor_data
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON device_alerts
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO iot_devices (device_id, device_name, device_type, location) VALUES
  ('SENSOR_001', 'Temperature Sensor 1', 'temperature_sensor', 'Room A'),
  ('SENSOR_002', 'Humidity Sensor 1', 'humidity_sensor', 'Room B'),
  ('SENSOR_003', 'Multi Sensor 1', 'multi_sensor', 'Outdoor')
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample sensor data
INSERT INTO sensor_data (device_id, temperature, humidity, pressure, battery_level, signal_strength) VALUES
  ('SENSOR_001', 23.5, 45.2, 1013.25, 85, -65),
  ('SENSOR_002', 22.1, 52.8, 1012.80, 92, -58),
  ('SENSOR_003', 25.3, 48.5, 1014.10, 78, -62);

COMMENT ON TABLE iot_devices IS 'Stores information about IoT devices';
COMMENT ON TABLE sensor_data IS 'Stores sensor readings from IoT devices';
COMMENT ON TABLE device_alerts IS 'Stores alerts generated from sensor data';
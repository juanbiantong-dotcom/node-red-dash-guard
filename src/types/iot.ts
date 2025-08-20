export interface IoTDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  battery_level?: number;
  signal_strength?: number;
  timestamp: string;
  raw_data?: Record<string, any>;
}

export interface DeviceAlert {
  id: string;
  device_id: string;
  alert_type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}
import { supabase } from '@/integrations/supabase/client';
import { IoTDevice, SensorReading, DeviceAlert } from '@/types/iot';

export class IoTService {
  // Device management
  static async getAllDevices(): Promise<IoTDevice[]> {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createDevice(device: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>): Promise<IoTDevice> {
    const { data, error } = await supabase
      .from('iot_devices')
      .insert(device)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateDeviceStatus(deviceId: string, status: IoTDevice['status']): Promise<void> {
    const { error } = await supabase
      .from('iot_devices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('device_id', deviceId);
    
    if (error) throw error;
  }

  // Sensor data management
  static async getLatestSensorData(deviceId: string): Promise<SensorReading | null> {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getSensorDataHistory(deviceId: string, hours: number = 24): Promise<SensorReading[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', since)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async insertSensorData(reading: Omit<SensorReading, 'id' | 'timestamp'>): Promise<SensorReading> {
    const { data, error } = await supabase
      .from('sensor_data')
      .insert(reading)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Alerts management
  static async getActiveAlerts(): Promise<DeviceAlert[]> {
    const { data, error } = await supabase
      .from('device_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createAlert(alert: Omit<DeviceAlert, 'id' | 'created_at' | 'is_resolved'>): Promise<DeviceAlert> {
    const { data, error } = await supabase
      .from('device_alerts')
      .insert({ ...alert, is_resolved: false })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('device_alerts')
      .update({ 
        is_resolved: true, 
        resolved_at: new Date().toISOString() 
      })
      .eq('id', alertId);
    
    if (error) throw error;
  }

  // Real-time subscriptions
  static subscribeToSensorData(deviceId: string, callback: (reading: SensorReading) => void) {
    return supabase
      .channel(`sensor_data_${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
          filter: `device_id=eq.${deviceId}`
        },
        (payload) => callback(payload.new as SensorReading)
      )
      .subscribe();
  }

  static subscribeToAlerts(callback: (alert: DeviceAlert) => void) {
    return supabase
      .channel('device_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_alerts'
        },
        (payload) => callback(payload.new as DeviceAlert)
      )
      .subscribe();
  }
}
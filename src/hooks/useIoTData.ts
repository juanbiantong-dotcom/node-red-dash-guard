import { useState, useEffect } from 'react';
import { IoTService } from '@/services/iotService';
import { SensorReading, DeviceAlert, IoTDevice } from '@/types/iot';
import { useToast } from '@/hooks/use-toast';

export const useIoTData = (deviceId?: string) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load devices
        const devicesData = await IoTService.getAllDevices();
        setDevices(devicesData);

        // Load latest reading for specific device
        if (deviceId) {
          const reading = await IoTService.getLatestSensorData(deviceId);
          setLatestReading(reading);
        }

        // Load active alerts
        const alertsData = await IoTService.getActiveAlerts();
        setAlerts(alertsData);

      } catch (error) {
        console.error('Error loading IoT data:', error);
        toast({
          title: "Error",
          description: "Failed to load IoT data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [deviceId, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    let sensorSubscription: any;
    let alertSubscription: any;

    // Subscribe to sensor data updates
    if (deviceId) {
      sensorSubscription = IoTService.subscribeToSensorData(deviceId, (newReading) => {
        setLatestReading(newReading);
        toast({
          title: "New Data",
          description: `Updated data from ${deviceId}`,
        });
      });
    }

    // Subscribe to alert updates
    alertSubscription = IoTService.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      toast({
        title: "New Alert",
        description: newAlert.message,
        variant: newAlert.severity === 'error' || newAlert.severity === 'critical' 
          ? 'destructive' 
          : 'default',
      });
    });

    // Cleanup subscriptions
    return () => {
      if (sensorSubscription) {
        sensorSubscription.unsubscribe();
      }
      if (alertSubscription) {
        alertSubscription.unsubscribe();
      }
    };
  }, [deviceId, toast]);

  // Helper functions
  const createDevice = async (deviceData: Omit<IoTDevice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newDevice = await IoTService.createDevice(deviceData);
      setDevices(prev => [newDevice, ...prev]);
      toast({
        title: "Success",
        description: "Device created successfully",
      });
      return newDevice;
    } catch (error) {
      console.error('Error creating device:', error);
      toast({
        title: "Error",
        description: "Failed to create device",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: IoTDevice['status']) => {
    try {
      await IoTService.updateDeviceStatus(deviceId, status);
      setDevices(prev => 
        prev.map(device => 
          device.device_id === deviceId 
            ? { ...device, status, updated_at: new Date().toISOString() }
            : device
        )
      );
      toast({
        title: "Success",
        description: "Device status updated",
      });
    } catch (error) {
      console.error('Error updating device status:', error);
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await IoTService.resolveAlert(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
            : alert
        )
      );
      toast({
        title: "Success",
        description: "Alert resolved",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    devices,
    latestReading,
    alerts,
    isLoading,
    createDevice,
    updateDeviceStatus,
    resolveAlert,
    // Computed values
    activeDevices: devices.filter(d => d.status === 'active'),
    criticalAlerts: alerts.filter(a => !a.is_resolved && a.severity === 'critical'),
  };
};
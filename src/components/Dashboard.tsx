import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Thermometer, Droplets, Power, Settings, LogOut } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

interface SensorData {
  temperature: number;
  humidity: number;
  status: string;
  lastUpdate: string;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24.5,
    humidity: 65,
    status: "online",
    lastUpdate: new Date().toLocaleTimeString()
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        temperature: Number((20 + Math.random() * 15).toFixed(1)),
        humidity: Number((50 + Math.random() * 30).toFixed(0)),
        status: Math.random() > 0.1 ? "online" : "offline",
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">IoT Monitoring Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Temperature Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.temperature}°C</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {sensorData.lastUpdate}
              </p>
            </CardContent>
          </Card>

          {/* Humidity Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.humidity}%</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {sensorData.lastUpdate}
              </p>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Device Status</CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={sensorData.status === "online" ? "default" : "destructive"}>
                  {sensorData.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Node-Red Connection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest sensor readings and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Temperature reading received</p>
                  <p className="text-xs text-muted-foreground">{sensorData.temperature}°C - {sensorData.lastUpdate}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Humidity reading received</p>
                  <p className="text-xs text-muted-foreground">{sensorData.humidity}% - {sensorData.lastUpdate}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Node-Red connection established</p>
                  <p className="text-xs text-muted-foreground">System online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
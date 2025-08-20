import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the incoming HiveMQ data
    const { device_id, temperature, humidity, pressure, battery_level, signal_strength, raw_data } = await req.json()

    console.log('Received HiveMQ data:', { device_id, temperature, humidity, pressure, battery_level, signal_strength })

    // Validate required fields
    if (!device_id) {
      throw new Error('device_id is required')
    }

    // Check if device exists, create if not
    const { data: existingDevice } = await supabaseClient
      .from('iot_devices')
      .select('device_id')
      .eq('device_id', device_id)
      .single()

    if (!existingDevice) {
      // Create new device if it doesn't exist
      await supabaseClient
        .from('iot_devices')
        .insert({
          device_id,
          device_name: `Device ${device_id}`,
          device_type: 'sensor',
          status: 'active'
        })
    }

    // Insert sensor data
    const { data: sensorData, error: sensorError } = await supabaseClient
      .from('sensor_data')
      .insert({
        device_id,
        temperature: temperature || null,
        humidity: humidity || null,
        pressure: pressure || null,
        battery_level: battery_level || null,
        signal_strength: signal_strength || null,
        raw_data: raw_data || null
      })
      .select()
      .single()

    if (sensorError) {
      throw sensorError
    }

    // Check for alerts based on sensor data
    const alerts = []

    // Temperature alerts
    if (temperature !== undefined) {
      if (temperature > 35) {
        alerts.push({
          device_id,
          alert_type: 'high_temperature',
          message: `High temperature detected: ${temperature}°C`,
          severity: 'warning'
        })
      }
      if (temperature < 0) {
        alerts.push({
          device_id,
          alert_type: 'low_temperature',
          message: `Low temperature detected: ${temperature}°C`,
          severity: 'warning'
        })
      }
    }

    // Humidity alerts
    if (humidity !== undefined) {
      if (humidity > 80) {
        alerts.push({
          device_id,
          alert_type: 'high_humidity',
          message: `High humidity detected: ${humidity}%`,
          severity: 'info'
        })
      }
    }

    // Battery alerts
    if (battery_level !== undefined && battery_level < 20) {
      alerts.push({
        device_id,
        alert_type: 'low_battery',
        message: `Low battery level: ${battery_level}%`,
        severity: 'error'
      })
    }

    // Insert alerts if any
    if (alerts.length > 0) {
      await supabaseClient
        .from('device_alerts')
        .insert(alerts)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: sensorData,
        alerts_created: alerts.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing HiveMQ data:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
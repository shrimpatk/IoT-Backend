export interface TemperatureInterface {
  value: number;
  unit: string;
  timestamp: number;
}

export interface HumidityInterface {
  value: number;
  unit: string;
  timestamp: number;
}

export interface AirInterface {
  value: number;
  unit: string;
  timestamp: number;
}

export interface CoInterface {
  value: number;
  unit: string;
  timestamp: number;
}

export interface AirQualityInterface {
  air: AirInterface;
  co: CoInterface;
}

export interface EnvironmentalInterface {
  temperature: TemperatureInterface;
  humidity: HumidityInterface;
}

export interface StatusInterface {
  online: string;
  rssi: number;
  uptime: number;
  timestamp: string;
}

export interface SensorsInterface {
  environmental: EnvironmentalInterface;
  air_quality: AirQualityInterface;
}

export interface Device {
  device_id: string;
  last_seen: string;
  sensors: SensorsInterface;
  status: StatusInterface;
  room: string;
}

export interface SensorDataInterface {
  timestamp: number;
  devices: Device[];
}

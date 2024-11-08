// sensor-data.model.ts
import { Field, ObjectType, Float } from '@nestjs/graphql';
import {
  AirQualityInterface,
  AirInterface,
  CoInterface,
  EnvironmentalInterface,
  HumidityInterface,
  SensorsInterface,
  StatusInterface,
  TemperatureInterface,
} from '../../../interfaces/sensor-data.interface';

@ObjectType()
class Temperature {
  @Field(() => Float)
  value: number;

  @Field()
  unit: string;

  @Field(() => Float)
  timestamp: number;
}

@ObjectType()
class Humidity {
  @Field(() => Float)
  value: number;

  @Field()
  unit: string;

  @Field(() => Float)
  timestamp: number;
}

@ObjectType()
class Air {
  @Field(() => Float)
  value: number;

  @Field()
  unit: string;

  @Field(() => Float)
  timestamp: number;
}

@ObjectType()
class Co {
  @Field(() => Float)
  value: number;

  @Field()
  unit: string;

  @Field(() => Float)
  timestamp: number;
}

@ObjectType()
class Environmental {
  @Field(() => Temperature)
  temperature: TemperatureInterface;

  @Field(() => Humidity)
  humidity: HumidityInterface;
}

@ObjectType()
class AirQuality {
  @Field(() => Air)
  air: AirInterface;

  @Field(() => Co)
  co: CoInterface;
}

@ObjectType()
class Sensors {
  @Field(() => Environmental)
  environmental: EnvironmentalInterface;

  @Field(() => AirQuality)
  air_quality: AirQualityInterface;
}

@ObjectType()
class Status {
  @Field()
  online: string;

  @Field(() => Float)
  rssi: number;

  @Field(() => Float)
  uptime: number;

  @Field()
  timestamp: string;
}

@ObjectType()
class Device {
  @Field()
  device_id: string;

  @Field()
  last_seen: string;

  @Field(() => Sensors)
  sensors: SensorsInterface;

  @Field(() => Status)
  status: StatusInterface;

  @Field()
  room: string;
}

@ObjectType()
export class SensorData {
  @Field(() => Float)
  timestamp: number;

  @Field(() => [Device])
  devices: Device[];
}

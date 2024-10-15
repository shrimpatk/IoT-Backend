import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SensorTags {
  @Field()
  room: string;

  @Field()
  sensorType: string;

  @Field()
  model: string;

  @Field()
  deviceId: string;

  @Field()
  floor: string;
}

@ObjectType()
export class SensorFields {
  @Field(() => Float)
  temperature: number;

  @Field(() => Int)
  humidity: number;
}

@ObjectType()
export class SensorsData {
  @Field()
  measurement: string;

  @Field(() => SensorTags)
  tags: SensorTags;

  @Field(() => SensorFields)
  fields: SensorFields;

  @Field(() => Date)
  timestamp: Date;
}

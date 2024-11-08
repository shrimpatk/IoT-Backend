import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ThrottleSettings {
  @Field(() => Int)
  rate: number;

  @Field(() => Int)
  deviceId: string;
}

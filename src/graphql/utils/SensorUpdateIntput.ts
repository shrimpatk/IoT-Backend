import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateUserSettingInput {
  @Field(() => Float)
  temperature: number;

  @Field(() => Float)
  humidity: number;
}

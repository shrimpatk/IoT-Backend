import { InputType, Field, Int, Float } from "@nestjs/graphql";

@InputType()
export class CreateUserSettingInput {
  @Field(returns => Float)
  temperature: number;

  @Field(returns => Float)
  humidity: number;
}
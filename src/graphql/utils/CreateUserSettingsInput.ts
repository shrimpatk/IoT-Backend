import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateUserSettingInput {
  @Field(returns => Int)
  userId: number;

  @Field({ nullable: true, defaultValue: false })
  receiveNotifications: boolean;

  @Field({ nullable: true, defaultValue: false })
  receiveEmails: boolean;
}
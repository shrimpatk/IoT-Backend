import { ObjectType, Field, ID } from "@nestjs/graphql";
import { User } from "./User";

@ObjectType()
export class UserSetting {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field({ defaultValue: false })
  receiveNotifications: boolean;

  @Field({ defaultValue: false })
  receiveEmails: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
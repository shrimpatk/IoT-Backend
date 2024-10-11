import { ID, Field, ObjectType } from "@nestjs/graphql";
import { UserSetting } from "./UserSetting";
import { Role } from "./Role";

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true }) // tell GraphQL
  displayName?: string;      // tell TypeScript

  // UserSettings is child of User so User is a parent
  @Field(() => UserSetting,{ nullable: true })
  settings?: UserSetting

  @Field((type) => [Role])
  roles: Role[]

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  delatedAt?: Date;
}

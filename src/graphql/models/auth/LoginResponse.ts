import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user/User';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

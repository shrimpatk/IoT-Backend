import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateUser {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

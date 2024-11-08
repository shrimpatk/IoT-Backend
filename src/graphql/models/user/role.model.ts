import { ObjectType, ID, Field } from '@nestjs/graphql';
import { UserRole } from './user-role.model';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [UserRole])
  users: UserRole[];

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

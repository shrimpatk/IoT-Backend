import { ObjectType, ID, Field } from '@nestjs/graphql';
import { User } from './user.model';
import { Role } from './role.model';

@ObjectType()
export class UserRole {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  roleId: string;

  @Field(() => User)
  user: User;

  @Field(() => Role)
  role: Role;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

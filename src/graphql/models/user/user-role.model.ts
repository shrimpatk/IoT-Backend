import { ObjectType, ID, Field } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { RoleModel } from './role.model';

@ObjectType()
export class UserRoleModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  roleId: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => RoleModel)
  role: RoleModel;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

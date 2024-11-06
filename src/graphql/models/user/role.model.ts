import { ObjectType, ID, Field } from '@nestjs/graphql';
import { UserRoleModel } from './user-role.model';

@ObjectType()
export class RoleModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [UserRoleModel])
  users: UserRoleModel[];

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

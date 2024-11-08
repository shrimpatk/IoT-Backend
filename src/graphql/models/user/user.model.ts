import { ID, Field, ObjectType } from '@nestjs/graphql';
import { UserSettingModel } from './user-setting.model';
import { Role } from './role.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  displayName?: string;

  // UserSettings is child of UserModel so UserModel is a parent
  @Field(() => UserSettingModel, { nullable: true })
  settings?: UserSettingModel;

  @Field(() => [Role], { nullable: true })
  roles?: Role[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  delatedAt?: Date;
}

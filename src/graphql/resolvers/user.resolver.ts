import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserModel } from '../models/user/user.model';
import { CreateUserInput } from '../utils/CreateUserInput';
import { UserService } from 'src/service/user.service';
import { UseGuards } from '@nestjs/common';
import { JwtStrategy } from '../../guards/jwt.strategy';

@Resolver(() => UserModel) // Tell GraphQL that UserModel is a parent
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(JwtStrategy)
  @Query(() => UserModel, { nullable: true })
  getUserById(@Args('id') id: string) {
    return this.userService.getUserById(id);
  }

  // @ResolveField((returns) => UserSettingModel, { name: 'settings', nullable: true })
  // getUserSetting(@Parent() user: UserModel) {
  // 	return this.userService.getUserSetting(user.id);
  // }

  @Mutation(() => UserModel)
  createUser(@Args('createUserdata') createUserData: CreateUserInput) {
    return this.userService.createUser(createUserData);
  }
}

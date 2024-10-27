import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from '../models/user/User';
import { CreateUserInput } from '../utils/CreateUserInput';
import { UserService } from 'src/service/userService';
import { UseGuards } from '@nestjs/common';
import { JwtStrategy } from '../../guards/JwtStrategy';

@Resolver(() => User) // Tell GraphQL that User is a parent
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(JwtStrategy)
  @Query(() => User, { nullable: true })
  getUserById(@Args('id') id: string) {
    return this.userService.getUserById(id);
  }

  // @ResolveField((returns) => UserSetting, { name: 'settings', nullable: true })
  // getUserSetting(@Parent() user: User) {
  // 	return this.userService.getUserSetting(user.id);
  // }

  @Mutation(() => User)
  createUser(@Args('createUserdata') createUserData: CreateUserInput) {
    return this.userService.createUser(createUserData);
  }
}

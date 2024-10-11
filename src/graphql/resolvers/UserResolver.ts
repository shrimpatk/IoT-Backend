import { Resolver, Query, Args, Int, ResolveField, Parent, Mutation } from "@nestjs/graphql";
import { User } from "../models/user/User";
import { UserSetting } from "../models/user/UserSetting";
import { mockUsers } from "src/__mocks__/mockUsers";
import { CreateUserInput } from "../utils/CreateUserInput";
import { UserService } from "src/service/userService";

export let incrementId = 10;

@Resolver((of) => User) // Tell GraphQL that User is a parent
export class UserResolver {
	constructor(private userService: UserService) {}

	@Query((returns) => User, { nullable: true })
	getUserById(@Args('id') id: string) {
		return this.userService.getUserById(id)
	}

	// @Query(() => [User])
	// getAllUsers() {
	// 	return this.userService.getAllUser();
	// }

	// @ResolveField((returns) => UserSetting, { name: 'settings', nullable: true })
	// getUserSetting(@Parent() user: User) {
	// 	return this.userService.getUserSetting(user.id);
	// }

	@Mutation(returns => User)
	createUser(@Args('createUserdata') createUserData: CreateUserInput) {
    const {username, displayName} = createUserData;
		const newUser = { username, displayName, id: ++incrementId };
		mockUsers.push(newUser);
		return newUser;
	}
}
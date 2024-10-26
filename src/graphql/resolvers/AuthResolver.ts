import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../../service/authService';
import { GqlAuthGuard } from '../../guards/GqlAuthGuard';
import { LoginResponse } from '../models/auth/LoginResponse';
import { LoginInput } from '../utils/LoginInput';
import { User } from '../models/user/User';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: any,
  ) {
    const user = await this.authService.validateUser(
      loginInput.username,
      loginInput.password,
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return this.authService.login(user, context.res);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@Context() context: any): Promise<boolean> {
    const userId = context.req.user.userId;
    await this.authService.logout(userId);

    context.res.clearCookie('refresh_token');

    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@Context() context: any) {
    return context.req.user;
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './userService';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findOneByName(username);
      if (user && (await bcrypt.compare(password, user.h_password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { h_password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

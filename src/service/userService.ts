import { Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserInput } from '../graphql/utils/CreateUserInput';

export class UserService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    });
  }

  async findOneByName(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async createUser(createUserInput: CreateUserInput) {
    const { password, username, email, displayName } = createUserInput;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          h_password: hashedPassword,
          displayName: displayName || username.slice(3),
        },
      });

      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
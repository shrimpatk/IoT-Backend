import { Inject } from "@nestjs/common";
import { UserSetting } from "@prisma/client";
import { User } from "src/graphql/models/user/User";
import { PrismaService } from "src/prisma.service";

export class UserService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ 
      where: {
        id
      },
      include: {
        roles: true
      }
    })
  }

  // async getAllUser(): Promise<User[]> {
  //   return await this.prisma.user.findMany();
  // }

  // async getUserSetting(userId: string): Promise<UserSetting> {
  //   return await this.prisma.userSetting.findUnique({ where: { userId } })
  // }
}
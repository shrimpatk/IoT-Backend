import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async generateTokens(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(user.id),
      this.generateRefreshTokens(user.id),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    try {
      await this.saveRefreshToken(user.id, refreshToken);
    } catch (error) {
      console.error(error);
      return null;
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateAccessTokens(userId: string) {
    const payload = {
      sub: userId,
      type: 'access',
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN,
      expiresIn: '15m',
    });
  }

  private async generateRefreshTokens(userId: any) {
    const payload = {
      sub: userId,
      type: 'refresh',
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN,
      expiresIn: '7d',
    });
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async refreshAccessTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        return new UnauthorizedException('Invalid token type');
      }

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId: payload.sub,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        return new UnauthorizedException('Invalid refresh token');
      }

      const isValidToken = await bcrypt.compare(
        refreshToken,
        storedToken.token,
      );

      if (!isValidToken) {
        return new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.generateAccessTokens(payload.sub);

      return { access_token: newAccessToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_TOKEN,
      });

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async validateUser(username: string, password: string) {
    try {
      const user = await this.usersService.findOneByName(username);

      if (!user) {
        return null;
      }

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

  async login(user: any, res: any) {
    try {
      const token = await this.generateTokens(user);

      res.cookie('refresh_token', token.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { h_password, ...safeUser } = user;

      return {
        user: safeUser,
        access_token: token.access_token,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Login Failed');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

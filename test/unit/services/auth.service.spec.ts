import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/service/auth.service';
import { UserService } from '../../../src/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../src/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    h_password: 'hashedpassword',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserNoPassword = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockLoginInput = {
    username: 'testuser',
    password: 'password123',
  };

  const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
            findOneByName: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      jest.spyOn(userService, 'findOneByName').mockResolvedValue(mockUser);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser(
        mockLoginInput.username,
        mockLoginInput.password,
      );

      expect(result).toBeDefined();
      expect(result.username).toBe(mockLoginInput.username);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userService, 'findOneByName').mockResolvedValue(null);

      const result = await authService.validateUser('wronguser', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(userService, 'findOneByName').mockResolvedValue(mockUser);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await authService.validateUser(
        mockUser.username,
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user object when logged in', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      };

      jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await authService.login(mockUser, mockResponse);

      expect(result).toEqual({
        access_token: mockTokens.access_token,
        user: mockUserNoPassword,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
    });
  });

  describe('generateTokens', () => {
    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed_token'));
    });

    it('should generate both access and refresh tokens', async () => {
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({
        id: '1',
        token: 'hashed_refresh_token',
        userId: '1',
        createdAt: new Date(),
        expiresAt: new Date(),
      });

      const result = await authService.generateTokens(mockUser);

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('refresh_token', 10);
    });

    it('should return null if token creation fails', async () => {
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      jest
        .spyOn(prismaService.refreshToken, 'create')
        .mockRejectedValue(new Error('DB Error'));

      const result = await authService.generateTokens(mockUser);

      expect(result).toBeNull();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
});

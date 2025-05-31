import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user payload when credentials are valid', async () => {
      const mockUser = { userId: 1, username: 'testuser', password: 'hashedPassword' };
      mockUsersService.validateUser.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual({ userId: 1, username: 'testuser' });
      expect(mockUsersService.validateUser).toHaveBeenCalledWith('testuser', 'password');
    });

    it('should return null when credentials are invalid', async () => {
      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when user is valid', async () => {
      const user = { userId: 1, username: 'testuser' };
      const mockToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: mockToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
      });
    });
  });

  describe('register', () => {
    it('should create user and return access token', async () => {
      const mockUser = { userId: 1, username: 'newuser', password: 'hashedPassword' };
      const mockToken = 'mock.jwt.token';
      
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register('newuser', 'password');

      expect(result).toEqual({ access_token: mockToken });
      expect(mockUsersService.create).toHaveBeenCalledWith('newuser', 'password');
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUsersService.create.mockRejectedValue(new ConflictException('Username already exists'));

      await expect(service.register('existinguser', 'password')).rejects.toThrow(ConflictException);
    });
  });
});

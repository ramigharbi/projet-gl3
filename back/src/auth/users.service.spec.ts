import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    
    // Clear the users array before each test
    (service as any).users = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.create('testuser', 'password123');

      expect(result.username).toBe('testuser');
      expect(result.password).toBe(hashedPassword);
      expect(result.userId).toBeDefined();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException when username already exists', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      // Create first user
      await service.create('testuser', 'password123');

      // Try to create user with same username
      await expect(service.create('testuser', 'password456')).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return user when username exists', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      await service.create('testuser', 'password123');
      const result = await service.findOne('testuser');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    it('should return undefined when username does not exist', async () => {
      const result = await service.findOne('nonexistentuser');
      expect(result).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await service.create('testuser', 'password123');
      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
    });

    it('should return null when password is invalid', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await service.create('testuser', 'password123');
      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      const result = await service.validateUser('nonexistentuser', 'password123');
      expect(result).toBeNull();
    });
  });
});

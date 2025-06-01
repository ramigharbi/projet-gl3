import { Controller, Post, Body, UnauthorizedException, ValidationPipe, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with username and password'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'newuser' },
        password: { type: 'string', example: 'password123' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body(ValidationPipe) registerDto: { username: string; password: string }) {
    return this.authService.register(registerDto.username, registerDto.password);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Fetch all users with optional filtering by name or email'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' }
        }
      }
    }
  })
  async getAllUsers(@Query('query') query?: string) {
    return this.usersService.findAllUsers(query);
  }
}

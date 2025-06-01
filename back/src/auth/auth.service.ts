import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { AuthResult, UserPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }
  async validateUser(username: string, pass: string): Promise<UserPayload | null> {
    const user = await this.usersService.validateUser(username, pass);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserPayload): Promise<AuthResult> {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string): Promise<AuthResult> {
    const user = await this.usersService.create(username, password);
    const { password: _, ...userPayload } = user;
    return this.login(userPayload);
  }
}

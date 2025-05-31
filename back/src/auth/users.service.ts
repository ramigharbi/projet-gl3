import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { User } from './interfaces/auth.interface';

@Injectable()
export class UsersService {
  private readonly users: UserEntity[] = [];

  async findOne(username: string): Promise<UserEntity | undefined> {
    return this.users.find(user => user.username === username);
  }

  async create(username: string, password: string): Promise<UserEntity> {
    // Check if user already exists
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new UserEntity({ 
      userId: Date.now(), 
      username, 
      password: hashed 
    });
    
    this.users.push(user);
    return user;
  }

  async validateUser(username: string, pass: string): Promise<UserEntity | null> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }
}

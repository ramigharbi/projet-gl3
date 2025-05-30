import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export type User = {
  userId: number;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    // Example user: { userId: 1, username: 'test', password: 'hashed' }
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async create(username: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = { userId: Date.now(), username, password: hashed };
    this.users.push(user);
    return user;
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }
}

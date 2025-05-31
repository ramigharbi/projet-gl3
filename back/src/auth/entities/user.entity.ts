export class UserEntity {
  userId: number;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }

  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}

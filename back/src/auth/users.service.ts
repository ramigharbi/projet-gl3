import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { DocumentEntity } from '../documents/entities/document.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) { }

  async findOne(username: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(username: string, password: string): Promise<UserEntity> {
    // Check if username already exists
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hashed });
    return this.usersRepository.save(user);
  }

  async validateUser(username: string, pass: string): Promise<UserEntity | null> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async findAllUsers(query?: string): Promise<UserEntity[]> {
    if (query) {
      return this.usersRepository.find({
        where: { username: ILike(`%${query}%`) },
      });
    }
    return this.usersRepository.find();
  }

  async updateUserDocuments(userId: number, documentId: number, accessType: 'view' | 'edit'): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { userId }, relations: [
        'viewableDocuments', 'editableDocuments'
      ]
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const documentRepository = this.usersRepository.manager.getRepository(DocumentEntity);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document || !(document instanceof DocumentEntity)) {
      throw new BadRequestException('Document not found or invalid type');
    }

    if (accessType === 'view') {
      user.viewableDocuments = [...user.viewableDocuments, document];
    } else if (accessType === 'edit') {
      user.editableDocuments = [...user.editableDocuments, document];
    }

    return this.usersRepository.save(user);
  }
  async getSharedUsers(documentId: number): Promise<UserEntity[]> {
    const documentRepository = this.usersRepository.manager.getRepository(DocumentEntity);
    const document = await documentRepository.findOne({
      where: { id: documentId },
      relations: ['viewers', 'editors'],
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    const sharedUsers = [
      ...(document.viewers || []),
      ...(document.editors || []),
    ];

    return Array.from(new Set(sharedUsers)); // Remove duplicates
  }
}

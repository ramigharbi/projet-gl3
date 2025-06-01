import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { DocumentEntity } from './entities';
import { Document } from './interfaces';
import { UserEntity } from '../auth/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private documentsRepository: Repository<DocumentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  async create(createDocumentDto: CreateDocumentDto, ownerId: number): Promise<DocumentEntity> {
    const document = this.documentsRepository.create({
      title: createDocumentDto.title,
      content: createDocumentDto.content || '',
      ownerId,
    });
    return this.documentsRepository.save(document);
  }

  async findAll(): Promise<DocumentEntity[]> {
    return this.documentsRepository.find();
  }

  async findAllByOwner(ownerId: number): Promise<DocumentEntity[]> {
    return this.documentsRepository.find({ where: { ownerId } });
  }

  async findOne(id: number): Promise<DocumentEntity> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto, userId: number): Promise<DocumentEntity> {
    const document = await this.findOne(id);
    if (document.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own documents');
    }
    Object.assign(document, updateDocumentDto, { updatedAt: new Date() });
    return this.documentsRepository.save(document);
  }

  async remove(id: number, userId: number): Promise<{ success: boolean }> {
    const document = await this.findOne(id);
    if (document.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own documents');
    }
    await this.documentsRepository.delete(id);
    return { success: true };
  }

  async findByUser(userId: number): Promise<DocumentEntity[]> {
    return this.documentsRepository.find({
      where: { ownerId: userId },
    });
  }

  async sendInvite(documentId: number, userId: number, accessLevel: 'editor' | 'viewer'): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
      relations: ['editors', 'viewers'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (accessLevel === 'editor') {
      document.editors = [...(document.editors || []), user];
    } else {
      document.viewers = [...(document.viewers || []), user];
    }

    await this.documentsRepository.save(document);
  }

  async shareDocument(documentId: number, userId: number, accessType: 'view' | 'edit'): Promise<DocumentEntity> {
    const document = await this.documentsRepository.findOne({ where: { id: documentId }, relations: ['viewers', 'editors'] });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (accessType === 'view') {
      document.viewers = [...document.viewers, user];
    } else if (accessType === 'edit') {
      document.editors = [...document.editors, user];
    }

    return this.documentsRepository.save(document);
  }
  async findSharedDocuments(userId: number): Promise<DocumentEntity[]> {
    return this.documentsRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.viewers', 'viewer')
      .leftJoinAndSelect('document.editors', 'editor')
      .where('viewer.userId = :userId OR editor.userId = :userId', { userId })
      .getMany();
  }
}

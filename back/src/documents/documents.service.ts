import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { DocumentEntity } from './entities';
import { Document } from './interfaces';

@Injectable()
export class DocumentsService {
  private documents: DocumentEntity[] = [];
  private docId = 1;

  create(createDocumentDto: CreateDocumentDto, ownerId: number): DocumentEntity {
    const document = new DocumentEntity({
      id: this.docId++,
      title: createDocumentDto.title,
      content: createDocumentDto.content || '',
      ownerId,
    });
    
    this.documents.push(document);
    return document;
  }

  findAll(): DocumentEntity[] {
    return this.documents;
  }

  findAllByOwner(ownerId: number): DocumentEntity[] {
    return this.documents.filter(doc => doc.ownerId === ownerId);
  }

  findOne(id: number): DocumentEntity {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto, userId: number): DocumentEntity {
    const document = this.findOne(id);
    
    if (document.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own documents');
    }

    Object.assign(document, updateDocumentDto, { updatedAt: new Date() });
    return document;
  }

  remove(id: number, userId: number): { success: boolean } {
    const documentIndex = this.documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const document = this.documents[documentIndex];
    if (document.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own documents');
    }

    this.documents.splice(documentIndex, 1);
    return { success: true };
  }
}

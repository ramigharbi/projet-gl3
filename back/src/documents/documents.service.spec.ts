import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    
    // Clear documents before each test
    (service as any).documents = [];
    (service as any).docId = 1;
  });

  describe('create', () => {
    it('should create a document successfully', () => {
      const createDto = { title: 'Test Document', content: 'Test content' };
      const ownerId = 1;

      const result = service.create(createDto, ownerId);

      expect(result.title).toBe('Test Document');
      expect(result.content).toBe('Test content');
      expect(result.ownerId).toBe(ownerId);
      expect(result.id).toBe(1);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create document with empty content when not provided', () => {
      const createDto = { title: 'Test Document' };
      const ownerId = 1;

      const result = service.create(createDto, ownerId);

      expect(result.content).toBe('');
    });
  });

  describe('findAllByOwner', () => {
    it('should return only documents owned by the user', () => {
      service.create({ title: 'Doc 1' }, 1);
      service.create({ title: 'Doc 2' }, 2);
      service.create({ title: 'Doc 3' }, 1);

      const result = service.findAllByOwner(1);

      expect(result).toHaveLength(2);
      expect(result.every(doc => doc.ownerId === 1)).toBe(true);
    });

    it('should return empty array when user has no documents', () => {
      service.create({ title: 'Doc 1' }, 1);

      const result = service.findAllByOwner(2);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return document when it exists', () => {
      const doc = service.create({ title: 'Test Document' }, 1);

      const result = service.findOne(doc.id);

      expect(result).toEqual(doc);
    });

    it('should throw NotFoundException when document does not exist', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update document when user owns it', () => {
      const doc = service.create({ title: 'Original Title' }, 1);
      const updateDto = { title: 'Updated Title', content: 'Updated content' };

      const result = service.update(doc.id, updateDto, 1);

      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Updated content');
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw ForbiddenException when user does not own document', () => {
      const doc = service.create({ title: 'Test Document' }, 1);

      expect(() => service.update(doc.id, { title: 'Hacked' }, 2)).toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when document does not exist', () => {
      expect(() => service.update(999, { title: 'Updated' }, 1)).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove document when user owns it', () => {
      const doc = service.create({ title: 'Test Document' }, 1);

      const result = service.remove(doc.id, 1);

      expect(result).toEqual({ success: true });
      expect(() => service.findOne(doc.id)).toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', () => {
      const doc = service.create({ title: 'Test Document' }, 1);

      expect(() => service.remove(doc.id, 2)).toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when document does not exist', () => {
      expect(() => service.remove(999, 1)).toThrow(NotFoundException);
    });
  });
});

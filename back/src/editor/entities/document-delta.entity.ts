import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentEntity } from '../../documents/entities/document.entity';

/**
 * Records individual Quill delta operations with user attribution for a document (blame).
 */
@Entity('document_delta')
export class DocumentDeltaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Reference to the parent document */
  @ManyToOne(() => DocumentEntity, (doc) => doc.deltas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: DocumentEntity;

  /** Foreign key for document */
  @Column()
  documentId: number;

  /** Identifier of the user who made this delta */
  @Column()
  userId: string;

  /** Quill delta JSON payload */
  @Column('json')
  delta: any;

  @CreateDateColumn()
  createdAt: Date;
}

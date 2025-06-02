import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
// Update the import path if the file exists elsewhere, for example:
import { DocumentDeltaEntity } from '../../editor/entities/document-delta.entity';
// Or correct the path as needed based on your project structure.

@Entity('document')
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  ownerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.ownedDocuments)
  owner: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.viewableDocuments)
  @JoinTable()
  viewers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.editableDocuments)
  @JoinTable()
  editors: UserEntity[];

  @OneToMany(
    () => DocumentDeltaEntity,
    (delta: DocumentDeltaEntity) => delta.document,
  )
  deltas: DocumentDeltaEntity[];

  constructor(partial?: Partial<DocumentEntity>) {
    if (partial) Object.assign(this, partial);
  }
}

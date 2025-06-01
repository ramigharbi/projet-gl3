import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { DocumentEntity } from '../../documents/entities/document.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentEntity, (document) => document.owner)
  ownedDocuments: DocumentEntity[];

  @ManyToMany(() => DocumentEntity, (document) => document.viewers)
  viewableDocuments: DocumentEntity[];

  @ManyToMany(() => DocumentEntity, (document) => document.editors)
  editableDocuments: DocumentEntity[];

  constructor(partial?: Partial<UserEntity>) {
    if (partial) Object.assign(this, partial);
  }

  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}

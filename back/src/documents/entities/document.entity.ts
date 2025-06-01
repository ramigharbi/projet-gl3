import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';

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

  constructor(partial?: Partial<DocumentEntity>) {
    if (partial) Object.assign(this, partial);
  }
}

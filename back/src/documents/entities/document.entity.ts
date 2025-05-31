export class DocumentEntity {
  id: number;
  title: string;
  content: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<DocumentEntity>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }
}

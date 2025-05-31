export interface Document {
  id: number;
  title: string;
  content: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

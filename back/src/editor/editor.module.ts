import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../documents/entities/document.entity';
import { EditorGateway } from './editor.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [EditorGateway],
})
export class EditorModule {}

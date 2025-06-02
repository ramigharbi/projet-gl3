import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../documents/entities/document.entity';
import { DocumentDeltaEntity } from './entities/document-delta.entity';
import { EditorGateway } from './editor.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, DocumentDeltaEntity])],
  providers: [EditorGateway],
})
export class EditorModule {}

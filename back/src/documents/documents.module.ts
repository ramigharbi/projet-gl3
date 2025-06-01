import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentEntity } from './entities/document.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from 'src/auth/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService,UsersService],
  exports: [DocumentsService],
})
export class DocumentsModule { }

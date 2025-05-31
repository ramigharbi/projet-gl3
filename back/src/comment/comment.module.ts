import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { pubSubProvider } from '../pubsub.provider';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [CommentService, CommentResolver, pubSubProvider],
  exports: [CommentService],
})
export class CommentModule {}

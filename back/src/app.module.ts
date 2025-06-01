import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { HealthModule } from './health/health.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { EditorModule } from './editor/editor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'projetweb',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production!
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),
    EventEmitterModule.forRoot(),
    CommentModule,
    NotificationModule,
    EditorModule,
    AuthModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

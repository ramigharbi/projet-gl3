import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UsersService } from './auth/users.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController, AuthController, DocumentsController],
  providers: [AppService, AuthService, UsersService, JwtStrategy],
})
export class AppModule {}

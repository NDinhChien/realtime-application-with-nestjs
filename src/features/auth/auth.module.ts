import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { AuthConfig } from './auth.config';
import { GoogleAuthService } from './service/google-auth.service';
import { UserModule } from '../user/user.module';
import { forwardRef } from '@nestjs/common/utils';
import { JwtModule } from '@nestjs/jwt';

const facebook = AuthConfig.facebook;

@Module({
  imports: [
    JwtModule.register({global: true}),
    forwardRef(() => UserModule),
    FacebookAuthModule.forRoot({
      clientId: Number(facebook.appId),
      clientSecret: facebook.appSecret,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, GoogleAuthService],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

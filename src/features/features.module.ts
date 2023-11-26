import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GroupModule,
    MessageModule,
  ],
  controllers: [],
  exports: [
    AuthModule,
    UserModule,
    GroupModule,
    MessageModule,
  ],
})
export class FeaturesModule {}

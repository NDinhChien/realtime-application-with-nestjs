import { UserController } from './controller/user.controller';
import {
  forwardRef,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserGateway } from './gateway/user.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import {
  SocketConnection,
  SocketConnectionSchema,
} from './schema/socket-connection.schema';
import { SocketConnectionService } from './service/socket-connection.service';
import { Code, CodeSchema } from './schema/code.schema';
import { CodeController } from './controller/code.controller';
import { CodeService } from './service/code.service';
import { MailModule } from '../mail/mail.module';
import { GroupModule } from '../group/group.module';
import { RequestController } from './controller/request.controller';
import { RequestService } from './service/request.service';
import { Request, RequestSchema } from './schema/request.schema';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/service/auth.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Code.name,
        schema: CodeSchema,
      },
      {
        name: SocketConnection.name,
        schema: SocketConnectionSchema,
      },
      {
        name: Request.name,
        schema: RequestSchema,
      },
    ]),
    MailModule,
    MediaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => GroupModule),
  ],
  controllers: [
    UserController,
    CodeController,
    RequestController,
  ],
  providers: [
    UserGateway,
    UserService,
    SocketConnectionService,
    CodeService,
    RequestService,
    AuthService, JwtAuthGuard
  ],
  exports: [
    UserService,
    CodeService,
    SocketConnectionService,
    AuthService, JwtAuthGuard
  ],
})
export class UserModule implements OnModuleInit, OnModuleDestroy {
  constructor(private socketConnectionService: SocketConnectionService) {}

  onModuleInit() {
    return this.deleteConnections();
  }

  onModuleDestroy() {
    return this.deleteConnections();
  }

  private deleteConnections() {
    return this.socketConnectionService.deleteAllConnections();
  }
}

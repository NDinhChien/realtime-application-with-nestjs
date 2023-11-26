import { MessageService } from './service/message.service';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectMessage, DirectMessageSchema, GroupMessage, GroupMessageSchema,} from './schema/message.schema';
import { GroupModule } from '../group/group.module';
import { MessageController } from './controller/message.controller';
import { MessageGateway } from './gateway/message.gateway';
import { UserModule } from '../user/user.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DirectMessage.name,
        schema: DirectMessageSchema,
      },
      {
        name: GroupMessage.name,
        schema: GroupMessageSchema,
      },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => GroupModule),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}

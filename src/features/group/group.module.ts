import { GroupService } from './service/group.service';
import { GroupController } from './controller/group.controller';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schema/group.schema';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}

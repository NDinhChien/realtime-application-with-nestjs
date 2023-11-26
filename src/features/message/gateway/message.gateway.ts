import {
  HttpStatus,
  UseFilters,
  UsePipes,
  ForbiddenException
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExceptionsFilter } from '../../../shared/core/filter/exceptions.filter';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GroupService } from '../../group/service/group.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { MessageService } from '../service/message.service';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { UserId } from '../../user/dto/request/create-request.dto';
import { GroupId } from '../../user/dto/request/create-request.dto';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { isEqual } from '../../../shared/mongoose/isEqual';
import { getValidationPipe } from '../../../shared/pipe/validation-pipe';
import { DirectMessageBody } from '../dto/direct-message.dto';
import { GroupMessageBody } from '../dto/group-message.dto';
/*

message:direct                 v
message:direct_typing          v
message:group                  v
message:group_typing           v

*/

@UsePipes(getValidationPipe())
@UseFilters(ExceptionsFilter)
@JwtAuth()
@WebSocketGateway()
export class MessageGateway {

  @WebSocketServer() server: Server;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private groupService: GroupService,
  ) {}

  @SubscribeMessage('message:direct')
  async sendDirectMessage(
    @MessageBody() body: DirectMessageBody,
    @CurrentUser() me: User,
  ): Promise<boolean> {
    const to = await this.userService.validateUserById(body.id, this.userService.publicFields, true);
    const sendToMe = isEqual(me._id, to._id);

    if (!sendToMe && await this.sendOrNot('toFriend', me, to._id)) {}
    
    const message = await this.messageService.createDirectMessage(
      me,
      to,
      body.message,
    );

    this.userService.sendMessage(me._id, 'message:direct', message);
    if (sendToMe) {
      return true;
    }

    this.userService.sendMessage(to._id, 'message:direct', message);

    return true;
  }

  @SubscribeMessage('message:direct_typing')
  async sendDirectTyping(
    @ConnectedSocket() socket: Socket,
    @CurrentUser() me: User,
    @MessageBody() body: UserId,
  ): Promise<boolean> {

    const to = await this.userService.validateUserById(body.id, this.userService.publicFields, true);
    const sendToMe = isEqual(me._id, to._id);
    if (sendToMe) {
      return true;
    }
    if (await this.sendOrNot('toFriend', me, to._id)) {}

    return this.userService.sendMessageExcept(
      socket,
      to._id,
      'message:direct_typing',
      this.userService.filterUser(me)
    );
  }

  @SubscribeMessage('message:group')
  async sendGroupMessage(
    @MessageBody() body: GroupMessageBody,
    @CurrentUser() me: User,
  ): Promise<boolean> {
    const group = await this.groupService.validateGroup(body.groupId, this.groupService.publicFields);
    
    if (!group.isPublic && await this.sendOrNot('toGroup', me, group._id)) {}

    const message = await this.messageService.createGroupMessage(
      me,
      group,
      body.message,
    );

    return this.groupService.sendMessage(group._id, 'message:group', message);
  }

  @SubscribeMessage('message:group_typing')
  async sendGroupTyping(
    @ConnectedSocket() socket: Socket,
    @CurrentUser() me: User,
    @MessageBody() body: GroupId,
  ): Promise<boolean> {
    const group = await this.groupService.validateGroup(body.groupId, this.groupService.publicFields);

    if (!group.isPublic && await this.sendOrNot('toGroup', me, group._id)) {}

    return this.groupService.sendMessageExcept(
      socket,
      group._id,
      'message:group_typing',
      this.userService.filterUser(me),
    );
  }

  async sendOrNot(type: 'toFriend' | 'toGroup', from: User, to: ObjectId) { 
    if (type === 'toFriend' && ! await this.userService.isFriend(from, to)) {
      throw new ForbiddenException('You can only send messages to friends.')
    }
    else if (type === 'toGroup' && ! await this.groupService.hasMember(to, from._id)) { //!from.isMember(to)
      throw new ForbiddenException('You are not a member of this private group.')
    }
    return true;
  }
}

 
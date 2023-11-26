import { Query } from '@nestjs/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GroupService } from '../../group/service/group.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { AfterQuery, BeforeQuery, FetchGroupMessagesAfterQuery, FetchGroupMessagesBeforeQuery, FetchMessagesAfterQuery, FetchMessagesBeforeQuery, GetGroupMessagesRes, GetMessagesRes, GroupIdQuery, LimitQuery, UserIdQuery } from '../dto/fetch-messages.dto';
import { MessageService } from '../service/message.service';
import { DirectMessage, GroupMessage } from '../schema/message.schema';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreApiResponse } from '../../../shared/core/CoreApiResponse';
import { DeleteDirectMessagesRes, DeleteGroupMessagesBody, DeleteGroupMessagesRes, DeleteMessageBody, DeleteMessageRes } from '../dto/delete-message.dto';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { UserId } from '../../user/dto/request/create-request.dto';
import { isEqual } from '../../../shared/mongoose/isEqual';
import { ObjectId } from '../../../shared/mongoose/object-id';
/*

GET  message/group/before?groupId=&limit=&before=    v 
GET  message/group/after?groupId=&limit=&after=      v

GET  message/direct/after?id=&limit=&after=          v 
GET  message/direct/before?id=&limit=&before=        v

DEL  message/direct { messageId }                    v
DEL  message/group  { messageId }                    v
DEL  message/direct/all { id }                       v   
DEL  message/group/all  { groupId }                  v  

*/

@ApiBearerAuth()
@JwtAuth()
@ApiTags('message')
@Controller('message')
export class MessageController {
  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private messageService: MessageService,
  ) {}

  @ApiResponse({type: GetMessagesRes})
  @ApiQuery(UserIdQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(BeforeQuery)
  @Get('direct/before')
  async getDirectMessagesBefore(
    @CurrentUser() me: User,
    @Query() query: FetchMessagesBeforeQuery
  ): Promise<CoreApiResponse<DirectMessage[]>> {
    const to = await this.userService.validateUserById(query.id, '_id', true);
    return CoreApiResponse.new(HttpStatus.OK, 'direct messages get success', 
      await this.messageService.getDirectMessages(
        'before',
        me._id,
        to._id,
        query.limit,
        query.before,
      ))
  }
  
  @ApiResponse({type: GetMessagesRes})
  @ApiQuery(UserIdQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(AfterQuery)
  @Get('direct/after')
  async getDirectMessagesAfter(
    @CurrentUser() me: User,
    @Query() query: FetchMessagesAfterQuery
  ): Promise<CoreApiResponse<DirectMessage[]>> {
    const to = await this.userService.validateUserById(query.id, '_id', true)
    return CoreApiResponse.new(HttpStatus.OK, 'direct messages get success', 
      await this.messageService.getDirectMessages(
        'after',
        me._id,
        to._id,
        query.limit,
        query.after,
      ))
  }

  async getGroupMessagesOrNot(user: User, groupId: ObjectId, ): Promise<boolean> {
    const group = await this.groupService.validateGroup(
      groupId, 
      this.groupService.publicFields,
    );
    if (!group.isPublic && !user.isMember(group._id)) {
      throw new ForbiddenException('You are not a member of this private group')
    }
    return true;
  }


  @ApiResponse({type: GetGroupMessagesRes})
  @ApiQuery(GroupIdQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(BeforeQuery)
  @Get('group/before')
  async getGroupMessagesBefore(
    @CurrentUser() me: User,
    @Query() query: FetchGroupMessagesBeforeQuery,
  ): Promise<CoreApiResponse<GroupMessage[]>> {
    await this.getGroupMessagesOrNot(me, query.groupId);

    return CoreApiResponse.new(HttpStatus.OK, 'group messages get success',
      await this.messageService.getGroupMessages(
        'before',
        query.groupId,
        query.limit,
        query.before,
      ));
  }

  @ApiResponse({type: GetGroupMessagesRes})
  @ApiQuery(GroupIdQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(AfterQuery)
  @Get('group/after')
  async getGroupMessagesAfter(
    @CurrentUser() me: User,
    @Query() query: FetchGroupMessagesAfterQuery,
  ): Promise<CoreApiResponse<GroupMessage[]>> {

    await this.getGroupMessagesOrNot(me, query.groupId);

    return CoreApiResponse.new(HttpStatus.OK, 'group messages get success',
      await this.messageService.getGroupMessages(
        'after',
        query.groupId,
        query.limit,
        query.after,
      ));
  
  }

  @ApiResponse({type: DeleteMessageRes})
  @ApiBody({type: DeleteMessageBody})
  @Delete('direct')
  async deleteDirectMessage(
    @Body() body: DeleteMessageBody,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<any>> {
    
    const message = await this.messageService.validateDirectMessage(body.messageId, this.messageService.fields());

    if (!isEqual(message.from, me._id)) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    this.messageService.deleteDirectMessage(message);
    return CoreApiResponse.new(HttpStatus.OK, 'message delete success', null);
  }


  @ApiResponse({type: DeleteMessageRes})
  @ApiBody({type: DeleteMessageBody})
  @Delete('group')
  async deleteGroupMessage(
    @Body() body: DeleteMessageBody,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<any>> {
    
    const message = await this.messageService.validateGroupMessage(body.messageId, this.messageService.fields());

    if (!isEqual(message.from, me._id)) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    this.messageService.deleteGroupMessage(message);
    return CoreApiResponse.new(HttpStatus.OK, 'message delete success', null);
  }


  @ApiResponse({type: DeleteDirectMessagesRes})
  @ApiBody({type: UserId})
  @Delete('direct/all')
  async deleteDirectMessages(
    @Body() body: UserId,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<any>> {

    const to = await this.userService.validateUserById(body.id, this.userService.publicFields, true);

    const deleteCount = await this.messageService.deleteDirectMessages(me, to);

    return CoreApiResponse.new(HttpStatus.OK, 'messages delete success', {
      deleteCount,
    });
  }

  @ApiResponse({type: DeleteGroupMessagesRes})
  @ApiBody({type: DeleteGroupMessagesBody})
  @Delete('group/all')
  async deleteGroupMessages(
    @Body() body: DeleteGroupMessagesBody,
    @CurrentUser() user: User,
  ): Promise<CoreApiResponse<any>> {
    const group = await this.groupService.validateGroup(body.groupId, this.groupService.publicFields);

    if (!isEqual(group.owner, user._id)) {
      throw new ForbiddenException('You are not the group owner')
    }

    const deleteCount = await this.messageService.deleteGroupMessages(group);
    return CoreApiResponse.new(HttpStatus.OK, 'group messages delete success', {
      deleteCount,
    })
  }
}

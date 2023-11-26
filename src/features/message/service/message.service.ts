import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Group } from '../../group/schema/group.schema';
import { GroupService } from '../../group/service/group.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { DirectMessage, GroupMessage, Message } from '../schema/message.schema';
import { ObjectId } from '../../../shared/mongoose/object-id';

@Injectable()
export class MessageService {
  
  constructor(
    @InjectModel(DirectMessage.name) private directMessageModel: Model<DirectMessage>,
    @InjectModel(GroupMessage.name) private groupMessageModel: Model<GroupMessage>,
    @Inject(forwardRef(() => GroupService)) private groupService: GroupService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  fields(...more: (keyof Message)[]) {
    return ['_id', 'from', 'to', 'group', ...more]; 
  }
  async validateDirectMessage(id: ObjectId, fields?: any): Promise<DirectMessage> {
    const message = await this.getDirectMessage(id, fields);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async validateGroupMessage(id: ObjectId, fields?: any): Promise<GroupMessage> {
    const message = await this.getGroupMessage(id, fields);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async getDirectMessage(id: ObjectId, fields?: any): Promise<DirectMessage|null> {

    return await this.directMessageModel
      .findById(id, fields).lean()
  }

  async getGroupMessage(id: ObjectId, fields?: any): Promise<GroupMessage|null> {
    return await this.groupMessageModel
      .findById(id, fields).lean()
  }

  
  async getDirectMessageBy(filter: FilterQuery<DirectMessage>): Promise<DirectMessage|null> {
    return await this.directMessageModel
      .findOne(filter).lean()
  }

  async getGroupMessageBy(filter: FilterQuery<GroupMessage>): Promise<GroupMessage|null> {
    return await this.groupMessageModel
      .findOne(filter).lean()
  }
  
  private async getMessages<T extends Message>(type: 'direct'|'group', filter: FilterQuery<T>, limit: number): Promise<T[]> {
    if (type==='direct') 
      return this.sortMessages(
        await this.directMessageModel
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      ) as T[];
    if (type === 'group') {
      return this.sortMessages(
        await this.groupMessageModel
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      ) as T[];
    }
    return [];
  }

  sortMessages(messages: Message[]) {
    return messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  async createDirectMessage(from: User, to: User, message: string): Promise<DirectMessage> {
    return await this.directMessageModel.create({
      from: from._id,
      to: to._id,
      message,
    });
  }

  async deleteDirectMessage(message: DirectMessage): Promise<void> {

    await this.directMessageModel.deleteOne({_id: message._id});

    this.userService.sendMessage(
      message.from,
      'message:direct_delete',
      message,
    );

    this.userService.sendMessage(
      message.to,
      'message:direct_delete',
      message,
    );
    
  }

  async deleteDirectMessages(from: User, to: User): Promise<number> {

    const result = await this.directMessageModel.deleteMany(
      {from: from._id, to: to._id}
    );

    if (result.deletedCount > 0) {
      this.userService.sendMessage(from._id, 'message:direct_delete_all', `from ${from.username} to ${to.username}`);
      this.userService.sendMessage(to._id, 'message:direct_delete_all', `from ${from.username} to ${to.username}`);  
      return result.deletedCount;
    }

    return 0;
  }
  
  private getDirectMessageFilter(fromId: ObjectId, toId: ObjectId): FilterQuery<DirectMessage> {
    return {
      $or: [
        { from: fromId, to: toId, },
        { to: fromId, from: toId, },
      ],
    };
  }

 getDateFilter(type: 'before'|'after', date?: Date) {
    if (!date) return {};
    else if (type === 'before') {
      return {createdAt: { $lte: date}}
    }
    else if (type === 'after') {
      return {createdAt: { $gt: date}}
    }
    return {};
  }

  async getDirectMessages(type: 'before'|'after', fromId: ObjectId, toId: ObjectId, limit = 30, date?: Date): Promise<DirectMessage[]> {

    const filter: FilterQuery<Group> = {
      ...this.getDirectMessageFilter(fromId, toId),
      ...this.getDateFilter(type, date),
    };
    return await this.getMessages<DirectMessage>('direct', filter, limit);
  }


  async getGroupMessages(type: 'before'|'after', groupId: ObjectId, limit=30, date?: Date): Promise<GroupMessage[]> {
    const filter: FilterQuery<Group> = {
      group: groupId,
      ...this.getDateFilter(type, date),
    };
    return await this.getMessages<GroupMessage>('group', filter, limit);
  }


  async createGroupMessage(from: User, group: Group, message: string): Promise<GroupMessage> {
    return await this.groupMessageModel.create({
      from: from._id,
      group: group._id,
      message,
    }); 
  }

  async deleteGroupMessage(message: GroupMessage): Promise<void> {

    await this.groupMessageModel.deleteOne({_id: message._id});
    
    this.groupService.sendMessage(message.group, 'message:group_delete', message);
  }

  async deleteGroupMessages(group: Group): Promise<number> {  
  
    const result = await this.groupMessageModel.deleteMany({ group: group._id });
    if (result.deletedCount > 0) {
      this.groupService.sendMessage(group._id, 'messages:group_delete', group.id);
      return result.deletedCount;
    }

    return 0;
  }

}

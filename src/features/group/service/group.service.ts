import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Socket } from 'socket.io';
import { MessageService } from '../../message/service/message.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { Group } from '../schema/group.schema';
import { CreateGroupBody } from '../dto/update-group.dto';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { remove } from '../../../shared/utils/remove';
import { isEqual } from '../../../shared/mongoose/isEqual';

@Injectable()
export class GroupService {

  publicFields: (keyof Group)[] = ['_id', 'title', 'isPublic', 'owner'];

  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @Inject(forwardRef(() => UserService))private userService: UserService,
    private messageService: MessageService,
  ) {}

  async create(body: CreateGroupBody, user: User): Promise<Group> {
    
    const group = await this.groupModel.create({ 
      ...body, 
      owner: user._id,
      members: [{_id: user._id, username: user.username}]
    });
    await this.addGroupToUser(group, user);
    return group;
  }

  async updateMember(groupId: ObjectId, user: User, id: ObjectId) {
    const {_id, username } = await this.userService.validateUserById(id, '_id, username', true);
    await this.groupModel.findOneAndUpdate(
      {_id: groupId, owner: user._id, 'members._id': id},
      {'members.$': {_id, username}}
    ).select('_id').lean();
  }

  async update(groupId: ObjectId, body: UpdateQuery<Group>, user: User): Promise<Group> {
    
    const updated = await this.groupModel
      .findOneAndUpdate({ _id: groupId, owner: user._id }, body, {new: true})
      .select(this.publicFields).lean();
    
    if (!updated) {
      throw new NotFoundException('Group does not exist.')
    }
    await this.userService.updateGroup(user, groupId);
    this.handleUpdateGroup(updated)
    return updated;
  }

  handleUpdateGroup(group: Group) {
    this.sendMessage(group._id, 'group:update', group);
  }

  async delete(user: User, groupId: ObjectId): Promise<Group> {
   
    const deleted = await this.groupModel.findOneAndDelete({ _id: groupId, owner: user._id }).lean();
    if (!deleted) {
      throw new NotFoundException('Group does not exist.')
    }
    
    await this.messageService.deleteGroupMessages(deleted);
    await this.userService.removeDeletedGroupFromUsers(deleted);

    this.sendMessage(groupId, 'group:delete', this.filterGroup(deleted))
    this.forceSocketsLeaveGroup(deleted);
    return deleted;

  }

  async forceSocketsLeaveGroup(group: Group) {
    this.getServer().in(`group_${group._id}`).socketsLeave(`group_${group._id}`);
  }

  async getGroupByIdAndOwner(groupId: ObjectId, ownerId: ObjectId, fields?: any): Promise<Group|null> {

    return await this.groupModel
      .findOne({ _id: groupId, owner: ownerId }, fields).lean()
  }

  async validateGroupByIdAndOwner(groupId: ObjectId, ownerId: ObjectId, fields?: any): Promise<Group> {
    const group = await this.getGroupByIdAndOwner(groupId, ownerId, fields);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  getIsPublicFilter(isPublic?: boolean) {
    if (isPublic) return {isPublic};
    return {};
  }
  
  async searchGroups(keyword: string, limit: number = 10, page: number = 0, isPublic?: boolean) {
    return await this.groupModel.find(
      {
        ...this.getIsPublicFilter(isPublic),
        $text: {$search: keyword, $caseSensitive: false}
      },
      { score: {$meta: "textScore"} }
    )
    .sort(
      { score: {$meta: "textScore"} }
    )
    .lean()
    .select(this.publicFields)
    .limit(limit)
    .skip(page)
  }
  
  async getGroup(groupId: ObjectId, fields?: any): Promise<Group|null> {
    return await this.groupModel.findById(groupId, fields).lean()
  }

  async validateGroup(groupId: ObjectId, fields?: any): Promise<Group> {
    const group = await this.getGroup(groupId, fields)

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async getGroupsByMember(user: User): Promise<Group[]> {
    return await this.groupModel
      .find({ 'members._id': {$eq: user._id}})
      .select(this.publicFields)
      .lean();
  }

  async getPublicGroups(): Promise<Group[]> {
    return await this.groupModel
      .find({ isPublic: true })
      .select(this.publicFields)
      .lean();
  }

  async getGroupsByOwner(user: User): Promise<Group[]> {
    return await this.groupModel.find({ owner: user._id }).select(this.publicFields).lean();
  }

  fields(...more: (keyof Group)[]) {
    return [...this.publicFields, ...more]
  }

  filterGroup(group: Group, fields: (keyof Group)[] = this.publicFields) {
    const groupObject: Record<string, any> = {};
    
    for (const field of fields) {
      groupObject[field] = group[field];
    }

    return groupObject as any;
  }

  sendMessage<T>(groupId: ObjectId, event: string, message?: T) {
    return this.getServer().to(`group_${groupId}`).emit(event, message);
  }

  sendMessageExcept<T>(socket: Socket, groupId: ObjectId, event: string, message: T) {
    return socket.broadcast.to(`group_${groupId}`).emit(event, message);
  }

  getServer() {
    return this.userService.getServer();
  }

  async addGroupToUser(group: Group, user: User) {
    const {_id, title, isPublic, owner} = group;
    if (!user.isMember(group._id)) {
      user.groups.push({
        _id, title, isPublic, owner,
      })
      await user.save();

      this.userService.joinGroupRoom(user, group._id)
      this.userService.sendMessage(user._id, 'group:subscribe', this.filterGroup(group)) 
    }
  }

  async removeGroupFromUser(group: Group, user: User) {
    const deleted = remove(user.groups, grp => isEqual(grp._id, group._id));
    if (deleted.length > 0) {
      await user.save();

      this.userService.leaveGroupRoom(user, group._id)
      this.userService.sendMessage(user._id, 'group:unsubscribe', this.filterGroup(group));
    }
  }

  async addGroup(group: Group, user: User) {

    await this.addMemberToGroup(group, user);
    await this.addGroupToUser(group, user);

  }

  async addMemberToGroup(group: Group, user: User) {
    const result = await this.groupModel.updateOne(
      {
        _id: group._id, 'members._id': {$ne: user._id},
      },
      {
        $push: {members: {_id: user._id, username: user.username}}
      }
    )
    
    if (result.modifiedCount > 0) {
      this.sendMessage(group._id, 'group:subscribe', this.userService.filterUser(user))
    }
  }

  async removeMemberFromGroup(group: Group, user: User) {
    const result = await this.groupModel.updateOne(
      {_id: group._id}, 
      { $pull: {members: {_id: user._id}}}
    )
    if (result.modifiedCount > 0) {
      this.sendMessage(group._id, 'group:unsubscribe', this.userService.filterUser(user));
    }
  }

  async removeGroup(user: User, group: Group) {
    
    await this.removeMemberFromGroup(group, user);
    await this.removeGroupFromUser(group, user);

  }
  
  async hasMember(groupId: ObjectId, id: ObjectId) {
    return !! await this.groupModel.exists({
      _id: groupId,
      'members._id': id,
    })
  }
}
  
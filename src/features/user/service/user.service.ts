import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { randomString } from '../../../shared/utils/random-string';
import { UserGateway } from '../gateway/user.gateway';
import { Socket } from 'socket.io';
import { SocketConnectionService } from './socket-connection.service';
import { Group } from '../../group/schema/group.schema';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { GroupService } from '../../group/service/group.service';

@Injectable()
export class UserService {
  
  publicFields: (keyof User)[] = ['_id', 'username', 'online'];

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => UserGateway)) private userGateway: UserGateway,
    @Inject(forwardRef(() => SocketConnectionService)) private socketConnectionService: SocketConnectionService,
    @Inject(forwardRef(() => GroupService)) private groupService: GroupService,
  ) {}

  async create(body: Partial<User>): Promise<User> {
    return await this.userModel.create(body);
  }
  
  async searchUsersLike(name: string, limit: number = 10, page: number = 0) {
    return await this.userModel.find({
      username: {$regex: `.*${name}.*`, $options: 'i'}
    })
    .select(this.publicFields)
    .limit(limit)
    .skip(page) 
    .lean()
  }

  async getUserByName(name: string, fields?: any, lean?: boolean): Promise<User|null> {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return await this.userModel.findOne({ username }, fields, { lean });
  }

  async validateUserByName(username: string, fields?: any, lean?: boolean): Promise<User> {
    const user = await this.getUserByName(username, fields, lean);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(mail: string, fields?: any, lean?: boolean): Promise<User|null> {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };
    
    return await this.userModel.findOne({ email }, fields, { lean });
  }

  async validateUserByEmail(email: string, fields?: any, lean?: boolean): Promise<User> {
    const user = await this.getUserByEmail(email, fields, lean);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserById(id: ObjectId, fields?: any, lean?: boolean): Promise<User|null> {
    return await this.userModel.findById(id, fields, { lean });
  }

  async validateUserById(id: ObjectId, fields?: any, lean?: boolean) {
    const user = await this.getUserById(id, fields, lean);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByGoogleId(id: string): Promise<User|null>  {
    return await this.userModel.findOne({ googleId: id });
  }

  async getUserByFacebookId(id: string): Promise<User|null>  {
    return await this.userModel.findOne({ facebookId: id });
  }

  async getUserBy(filter: FilterQuery<User>, fields?: any, lean?: boolean): Promise<User|null> {
    return await this.userModel.findOne(filter, fields, { lean });
  }

  async getOnlineUsers(): Promise<User[]> {
    return await this.userModel.find({ online: true }).select('_id');
  }

  async joinRooms(socket: Socket, user: User): Promise<void> {
    await socket.join(`user_${user._id}`);
    user.groups.forEach(async grp => await socket.join(`group_${grp._id}`))
  }

  async subscribeUser(socket: Socket, user: User): Promise<number> {
    if (socket.rooms.has(`user_${user._id}`)) return 0;
    
    await this.joinRooms(socket, user);
    return await this.socketConnectionService.create(socket, user);
  }

  async unsubscribeUser(socket: Socket): Promise<number> {
    socket.disconnect(true);
    return await this.socketConnectionService.delete(socket);
  }

  disconnectUserSockets(user:User) {
    this.getServer().in(`user_${user._id}`).disconnectSockets(true);
  }

  sendMessage<T>(userId: ObjectId, event: string, message?: T) {
    return this.userGateway.server.to(`user_${userId}`).emit(event, message);
  }

  sendMessageExcept<T>(socket: Socket, userId: ObjectId, event: string, message: T) {
    return socket.broadcast.to(`user_${userId}`).emit(event, message);
  }

  async generateUsername(base: string): Promise<string> {
    const name = base.replace(/[^a-zA-Z0-9_/-]/g, '');

    if (!(await this.getUserByName(name))) {
      return name;
    }

    return await this.generateUsername(name + randomString(1));
  }

  fields(...more: (keyof User)[]) {
    return [...this.publicFields, ...more]
  }

  filterUser(user: User, fields: (keyof User)[] = this.publicFields): any {
    const userObject: Record<string, any> = {};
    
    for (const field of fields) {
      userObject[field] = user[field];
    }

    return userObject;
  }

  filterUsers(users: User[], fields: (keyof User)[] = this.publicFields): any[] {
    return users.map(user => this.filterUser(user, fields))
  }

  getServer() {
    return this.userGateway.server;
  }

  async updateFriend(me: User, id: ObjectId) {
    const  { _id, username } = await this.validateUserById(id, '_id username', true);
    await this.userModel.findOneAndUpdate(
      {_id: me._id, 'friends._id': id},
      {'friends.$': {_id, username}}      
    ).select('_id').lean();
  }
  async updateGroup(me: User, groupId: ObjectId) {
    const { _id, owner, title, isPublic } = await this.groupService.validateGroup(groupId, this.groupService.publicFields);
    
    await this.userModel.findOneAndUpdate(
      {_id: me._id, 'groups._id': groupId},
      {'groups.$': {_id, owner, title, isPublic}}
    ).select('_id').lean();
  }

  async addFriendToList(from: User, to: User) {
    const result = await this.userModel.updateOne(
      {_id: from._id, 'friends._id': {$ne: to._id}}, 
      {$push: {friends: {_id: to._id, username: to.username}}}
    )
    if (result.modifiedCount > 0) {
      this.sendMessage(from._id, 'friend:add', this.filterUser(to))
    }
  }

  async removeFriendFromList(from: User, to: User) {
    const result = await this.userModel.updateOne(
      {_id: from._id},
      {$pull: {friends: {_id: to._id}}}
    )
    if (result.modifiedCount > 0) {
      this.sendMessage(from._id, 'friend:remove', this.filterUser(to))
    }
  }

  async removeFriend(from: User, to: User) {

    await this.removeFriendFromList(from, to);

    await this.removeFriendFromList(to, from);
  
  }


  async addFriend(from: User, to: User) {

    await this.addFriendToList(from, to);

    await this.addFriendToList(to, from);
  
  }

  async removeDeletedGroupFromUsers(group: Group) {
    const members = group.members.map(member => member._id);
    await this.userModel.updateMany(
      {
      _id: {$in: members}
      }, 
      {
        $pull: {groups: {_id: group._id}}
      })

  }

  async resetUserSession(user: User) {

    this.disconnectUserSockets(user);
    user.online = false;
    user.generateSessionToken();
    await user.save();
  
  }

  async fetchSockets(room: string): Promise<Socket[]> {
    return (await this.getServer().in(room).fetchSockets()) as any;
  }

  joinGroupRoom(user: User, groupId: ObjectId) {
    this.getServer().in(`user_${user._id}`).socketsJoin(`group_${groupId}`)
  }

  leaveGroupRoom(user: User, groupId: ObjectId) {
    this.getServer().in(`user_${user._id}`).socketsLeave(`group_${groupId}`)
  }
  
  async isFriend(user: User, id: ObjectId): Promise<boolean> {
    return !! await this.userModel.exists({
      _id: user._id,
      'friends._id': id,
    })
  }
}

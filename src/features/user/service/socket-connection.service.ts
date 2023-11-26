import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { SocketConnection } from '../schema/socket-connection.schema';
import { User } from '../schema/user.schema';
import { UserService } from './user.service';
import { ObjectId } from '../../../shared/mongoose/object-id';

@Injectable()
export class SocketConnectionService {
  constructor(
    @InjectModel(SocketConnection.name)
    private socketConnectionModel: Model<SocketConnection>,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  async create(socket: Socket, user: User): Promise<number> {
    await this.socketConnectionModel.create({
      socketId: socket.id,
      user: user._id,
    });

    if (!user.online) {
      user.online = true;
      await user.save();
      return 1;
    }
    return 0;
  }

  async getAll(userId: ObjectId): Promise<SocketConnection[]> {
    return await this.socketConnectionModel.find({ user: userId }).lean();
  }

  async getById(id: ObjectId): Promise<SocketConnection|null> {
    return await this.socketConnectionModel.findById(id).lean()
  }

  async getBySocket(socket: Socket): Promise<SocketConnection|null> {
    return await this.socketConnectionModel
      .findOne({ socketId: socket.id }).lean()
  }

  async deleteBySocket(socket: Socket): Promise<SocketConnection|null> {
    return await this.socketConnectionModel.findOneAndDelete({ socketId: socket.id}).lean();
  }

  async deleteAllConnections(): Promise<void> {
    await this.socketConnectionModel.deleteMany({});

    const users = await this.userService.getOnlineUsers();

    for (const user of users) {
      user.online = false;
      await user.save();
    }
  }

  async delete(socket: Socket): Promise<number> {
    const deleted = await this.deleteBySocket(socket);

    if (!deleted) {
      return 0;
    }

    const user = await this.userService.validateUserById(deleted.user, '_id');

    const connections = await this.getAll(user._id);

    if (connections.length === 0) {
      user.online = false;
      await user.save();
      return 1;
    }
    return 0;
  }
}

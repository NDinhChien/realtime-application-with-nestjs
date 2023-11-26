import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "../schema/notification.schema";
import { Model } from "mongoose";
import { ObjectId } from "../../../shared/mongoose/object-id";

@Injectable()
export class NotificationService {

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>
  ) {}

  async create(body: Partial<Notification>) {
    return await this.notificationModel.create(body);
  }

  async getForUser(id: ObjectId): Promise<Notification[]> {
    return await this.notificationModel.find({
      to: id,
    })
  }

  async getForUserBefore(id: ObjectId, before: Date): Promise<Notification[]> {
    return await this.notificationModel.find({
      to: id,
      createdAt: {$lte: before},
    })
  }

  async getForUserAfter(id: ObjectId, after: Date): Promise<Notification[]> {
    return await this.notificationModel.find({
      to: id,
      createdAt: {$gte: after},
    })
  }


}
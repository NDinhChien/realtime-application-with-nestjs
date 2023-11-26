import { Document } from "mongoose";
import { Prop, Schema } from "@nestjs/mongoose";
import { User } from "../../user/schema/user.schema";
import { ObjectId, ObjectIdType } from "../../../shared/mongoose/object-id";
import { createSchemaForClassWithMethods } from "../../../shared/mongoose/create-schema";


@Schema({
  versionKey: false,
  timestamps: true,
})
export class Notification extends Document {

  @Prop({required: true})
  message: string;

  @Prop({index: true, required: true, type: ObjectIdType, ref: User.name})
  to: ObjectId;

  createdAt: Date;
  updatedAt: Date;

}

export const NotificationSchema = createSchemaForClassWithMethods(Notification);
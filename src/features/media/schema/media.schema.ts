import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { createSchemaForClassWithMethods } from "../../../shared/mongoose/create-schema";
import { ObjectId, ObjectIdType } from "../../../shared/mongoose/object-id";
import { User } from "../../user/schema/user.schema";

export enum MediaType {
  FILE = 'file',
  IMAGE = 'image',
  AVATAR = 'avatar',
  AUDIO = 'audio',
}

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Media extends Document {

  @Prop({required: true,})
  name: string;
  
  @Prop({required: true, enum: Object.values(MediaType) })
  type: string;

  @Prop({required: true})
  size: number;

  @Prop({required: true, index: true, type: ObjectIdType, ref: User.name})
  owner: ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export const MediaSchema = createSchemaForClassWithMethods(Media);
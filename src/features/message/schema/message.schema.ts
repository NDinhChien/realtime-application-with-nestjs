import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { ObjectId, ObjectIdType } from '../../../shared/mongoose/object-id';
import { Group } from '../../group/schema/group.schema';
import { User } from '../../user/schema/user.schema';
import { Media } from '../../media/schema/media.schema';

export class Message extends Document {

  @Prop({ required: true })
  message: string;

  @Prop({ type: [ {type: ObjectIdType, ref: Media.name} ]})
  attachments: ObjectId[];

  @Prop({ index: true, required: true, type: ObjectIdType, ref: User.name })
  from: ObjectId;

  createdAt: Date;
  updatedAt: Date;

}

@Schema({
  versionKey: false,
  timestamps: true,
})
export class DirectMessage extends Message {

  @Prop({ required: true, type: ObjectIdType, ref: User.name })
  to: ObjectId;

}
export const DirectMessageSchema = createSchemaForClassWithMethods(DirectMessage);


@Schema({
  versionKey: false,
  timestamps: true,
})
export class GroupMessage extends Message { 

  @Prop({ index: true, type: ObjectIdType, ref: Group.name })
  group: ObjectId;

}
export const GroupMessageSchema = createSchemaForClassWithMethods(GroupMessage);
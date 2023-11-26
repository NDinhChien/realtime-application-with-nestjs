import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { User } from './user.schema';
import { ObjectId, ObjectIdType } from '../../../shared/mongoose/object-id';
import { Group } from '../../group/schema/group.schema';

export enum RequestType {
  FRIEND = 'friend',
  GROUP = 'group',
  INVITATION = 'invitation',
}

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Request extends Document {

  @Prop({index: true, required: true, type: String, enum: Object.values(RequestType)})
  type: RequestType;

  @Prop({ index: true, required: true, type: ObjectIdType, ref: User.name})
  from: ObjectId;

  @Prop({ required: true, type: ObjectIdType, ref: User.name})
  to: ObjectId;

  @Prop({ type: ObjectIdType, ref: Group.name})
  group?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const RequestSchema = createSchemaForClassWithMethods(Request);
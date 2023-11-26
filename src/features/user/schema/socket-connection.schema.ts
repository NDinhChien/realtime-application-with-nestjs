import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { User } from './user.schema';
import { ObjectId, ObjectIdType } from '../../../shared/mongoose/object-id';

@Schema({
  versionKey: false,
})
export class SocketConnection extends Document {
  
  @Prop({ required: true, unique: true })
  socketId: string;

  @Prop({ index: true, required: true, type: ObjectIdType, ref: User.name })
  user: ObjectId;
}

export const SocketConnectionSchema = createSchemaForClassWithMethods(
  SocketConnection,
);

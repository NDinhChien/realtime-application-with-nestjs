import { Prop, Schema} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { ObjectId, ObjectIdType } from '../../../shared/mongoose/object-id';
import { SubUser, SubUserSchema } from '../../user/schema/sub.schema';

@Schema({
  versionKey: false,
})
export class Group extends Document {
  @Prop({
    required: true, text: true,
  })
  title: string;

  @Prop({type: [SubUserSchema]})
  members: SubUser[];

  @Prop({ required: true, type: ObjectIdType, ref: 'User' })
  owner: ObjectId;

  @Prop({
    default: true,
  })
  isPublic: boolean;

}

export const GroupSchema = createSchemaForClassWithMethods(Group);





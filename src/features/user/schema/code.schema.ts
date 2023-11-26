import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';

export enum CodeType {
  REGISTER = 'register',
  RECOVER = 'recover',
}
@Schema({
  versionKey: false,
})
export class Code extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true })
  expiration: Date;
}

export const CodeSchema = createSchemaForClassWithMethods(Code);
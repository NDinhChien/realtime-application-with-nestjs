import { Prop, Schema } from "@nestjs/mongoose";
import { ObjectId, ObjectIdType } from "../../../shared/mongoose/object-id";
import { createSchemaForClassWithMethods } from "../../../shared/mongoose/create-schema";

@Schema({
  versionKey: false,
})
export class SubGroup {

  @Prop({required: true, type: ObjectIdType, ref: 'Group', index: true})
  _id: ObjectId;
 
  @Prop({required: true})
  title: string;

  @Prop({required: true, type: ObjectIdType, ref: 'User'})
  owner: ObjectId;
  
  @Prop({required: true})
  isPublic: boolean;

}
export const SubGroupSchema = createSchemaForClassWithMethods(SubGroup)

@Schema({
  versionKey: false,
})
export class SubUser {

  @Prop({required: true, type: ObjectIdType, ref: 'User', index: true})
  _id: ObjectId;

  @Prop({required: true})
  username: string;

}
export const SubUserSchema = createSchemaForClassWithMethods(SubUser);

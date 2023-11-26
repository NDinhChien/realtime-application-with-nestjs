import * as bcrypt from 'bcrypt';
import { Prop, Schema } from '@nestjs/mongoose';
import { randomString } from '../../../shared/utils/random-string';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { isEqual } from '../../../shared/mongoose/isEqual';
import { SubGroup, SubGroupSchema, SubUser, SubUserSchema } from './sub.schema';

export const usernameRegExp = /^[a-zA-Z0-9_\-]{2,20}$/;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class User extends Document {
  
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ default: randomString(60)})
  sessionToken: string;

  @Prop({ default: false, index: true })
  online: boolean;

  @Prop({type: [SubGroupSchema]})
  groups: SubGroup[]

  @Prop({type: [SubUserSchema]})
  friends: SubUser[]
  
  @Prop()
  password?: string;

  @Prop({ required: false, sparse: true })
  facebookId?: string;

  @Prop({ required: false, sparse: true })
  googleId?: string;

  createdAt: Date;
  updatedAt: Date;

  isSocial(): boolean {
    return !!(this.facebookId || this.googleId);
  }

  isMember(groupId: ObjectId): boolean {
    return this.groups.some(grp => isEqual(grp._id, groupId)) 
  }

  isOwner(groupId: ObjectId): boolean {
    const group = this.groups.find(grp => isEqual(grp._id, groupId));
    return group ? isEqual(group.owner, this._id) : false;
  }

  myGroups() {
    return this.groups.filter(grp => isEqual(grp.owner, this._id)); 
  }

  memberGroups() {
    return this.groups.filter(grp => !isEqual(grp.owner, this._id));
  }

  generateSessionToken() {
    this.sessionToken = randomString(60);
  }

  validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password || '');
  }
}

export const UserSchema = createSchemaForClassWithMethods(User);

UserSchema.pre('save', async function(next) {
  
  if (!this.password || this.password.startsWith('$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt();

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (e: any) {
    next(e);
  }
});


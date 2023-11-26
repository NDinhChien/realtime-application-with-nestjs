import { InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from "@nestjs/mongoose";
import { Media, MediaType } from "../schema/media.schema";
import { Model } from "mongoose";
import { ObjectId } from "../../../shared/mongoose/object-id";
import { AvatarConfig, storagePath } from "../media.config";
import path from "path";

export class MediaService {
  constructor(

    @InjectModel(Media.name) private mediaModel: Model<Media>,
    
  ) {}

  async createMedia(payload: CreateMediaPayload): Promise<Media>{
    return await this.mediaModel.create(payload);
  }

  async createAvatar(payload: CreateMediaPayload): Promise<Media> {
    if (payload.name !== this.getAvatarName(payload.owner)) {
      throw new InternalServerErrorException('Invalid avatar name.')
    }

    return await this.mediaModel.findOneAndUpdate(
      {
        name: payload.name,
        type: MediaType.AVATAR,
      }, {
        owner: payload.owner,
        size: payload.size,
      }, 
      {new: true, upsert: true}
    ).lean()
  }
  async getMediaById(mediaId: ObjectId): Promise<Media|null> {
    return await this.mediaModel.findById(mediaId)
  }

  getAvatarName(id: ObjectId) {
    return `${id}.${AvatarConfig.ext}`;
  }
  getMediaPath(type: MediaType, name: string) {
    return path.join(storagePath, type, name);
  }
}

export interface CreateMediaPayload {
  
  owner: ObjectId;

  name: string;

  type: MediaType;

  size: number;

}


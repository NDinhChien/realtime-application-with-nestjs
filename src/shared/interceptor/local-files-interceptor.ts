import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type, BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { User } from '../../features/user/schema/user.schema';
import { AvatarConfig, avatarExts, fileExts } from '../../features/media/media.config';
import * as mimes from 'mime-types';
import { MediaType } from '../../features/media/schema/media.schema';

export interface LocalFilesInterceptorOptions {
  fieldName: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
  fileName?: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => void;
  destination?: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => void;
}
 
export function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor> {

  @Injectable()
  class Interceptor implements NestInterceptor {

    fileInterceptor: NestInterceptor;

    constructor() {

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination: options.destination, 
          filename: options.fileName,
        }),
        fileFilter: options.fileFilter,
        limits: options.limits,
      }
      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions));
    
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  
  return mixin(Interceptor);
}

export function isMedia(mimeType: string, mediaType: MediaType) {
  const type = mimeType.split('/')[0];
  const ext = mimes.extension(mimeType);
  if (!type || !ext) return false;

  switch (mediaType) {
    case MediaType.IMAGE: {
      return type === 'image';
    }
    case MediaType.AUDIO: {
      return type === 'audio';
    }
    case MediaType.FILE: {
      return fileExts.includes(ext);
    }
    case MediaType.AVATAR: {
      return avatarExts.includes(ext);
    }
  }
}

export const AvatarInterceptor = LocalFilesInterceptor({
  fieldName: AvatarConfig.fieldName,
  fileFilter: (request, file, callback) => {
    if (!isMedia(file.mimetype, MediaType.AVATAR)) {
      return callback(new BadRequestException('Invalid file format'), false)
    }
    callback(null, true);
  },
  limits: {
    fileSize: AvatarConfig.maxSize,
  },
  fileName: (request, file, callback) => {
    callback(null, AvatarConfig.getName(request?.user as User));
  },
  destination: (request, file, callback) => {
    callback(null, AvatarConfig.path);
  }
})

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
 
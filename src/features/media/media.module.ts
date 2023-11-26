import { Module, } from '@nestjs/common';
import { MediaService } from './service/media.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './schema/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Media.name,
        schema: MediaSchema,
      },
    ]),
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ObjectId } from '../../../shared/mongoose/object-id';

export class DirectMessageBody {

  @MaxLength(2000)
  @IsString()
  message: string;

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

}
import { ApiProperty } from '@nestjs/swagger';
import { aMessage } from './message.example';
import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';
import { aGroup } from '../../group/dto/group.example';
import { Transform } from 'class-transformer';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { IsNotEmpty } from 'class-validator';
 

export class DeleteMessageBody {

  @ApiProperty({example: aMessage._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  messageId: ObjectId;

}

export class DeleteGroupMessagesBody {
  
  @ApiProperty({example: aGroup._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;

}

export class DeleteMessageRes extends HttpApiResponse {
  
  @ApiProperty({example: 'message delete success'})
  public message: string;

}

export class DeleteDirectMessagesRes extends HttpApiResponse {
  
  @ApiProperty({example: 'messages delete success'})
  public message: string;

}


export class DeleteGroupMessagesRes extends HttpApiResponse {

  @ApiProperty({example: 'group messages delete success'})
  public message: string;

}

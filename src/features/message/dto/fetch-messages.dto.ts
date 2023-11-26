import { ApiProperty, ApiQueryOptions } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';
import { aMessage, anotherMessage } from './message.example';
import { ObjectId,  } from '../../../shared/mongoose/object-id';

export const GroupIdQuery: ApiQueryOptions = {
  type: String,
  name: 'groupId',
  example: 'aaabbbcccdddeeefffggghhheee',
}

export const UserIdQuery: ApiQueryOptions = {
  name: 'id',
  required: true,
  type: String,
}

export const LimitQuery: ApiQueryOptions = {
  name: 'limit',
  required: false,
  type: Number,
}

export const BeforeQuery: ApiQueryOptions = {
  name: 'before',
  required: false,
  type: Date,
}

export const AfterQuery: ApiQueryOptions = {
  name: 'after',
  required: false,
  type: Date,
}

export class MessagesBefore {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  before?: Date;
}

export class MessagesAfter {

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  after?: Date;

}

export class FetchGroupMessagesBeforeQuery extends MessagesBefore {
  

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;

}

export class FetchGroupMessagesAfterQuery extends MessagesAfter {


  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;
  
}

export class FetchMessagesBeforeQuery extends MessagesBefore {


  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

}

export class FetchMessagesAfterQuery extends MessagesAfter  {


  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

}



export class GetMessagesRes extends HttpApiResponse {

  @ApiProperty({example: 'messages get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [aMessage, anotherMessage]})
  public data: any;

}

export class GetGroupMessagesRes extends HttpApiResponse {

  @ApiProperty({example: 'group messages get success'})
  public message: string;


  @ApiProperty({isArray: true, example: [
    {...aMessage, to: undefined, group: '111122223333444455555abcd' }, 
    {...anotherMessage, to: undefined, group: '111122223333444455555abcd'}
  ]})
  public data: any;

}
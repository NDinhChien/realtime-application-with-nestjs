import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';
import { ApiProperty} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { aGroup, anUser} from './group.example';
import { GroupId } from '../../user/dto/request/create-request.dto';
import { ObjectId } from '../../../shared/mongoose/object-id';


export class CreateGroupBody {
 
  @ApiProperty({example: aGroup.title})
  @MaxLength(60)
  @MinLength(6)
  @IsString()
  title: string;

  @ApiProperty({example: true})
  @IsBoolean()
  @Type(() => Boolean)
  isPublic: boolean;

}

export class CreateGroupRes extends HttpApiResponse {

  @ApiProperty({example: 'group create success'})
  public message: string;

  @ApiProperty({example: {aGroup}})
  public data: any;

}

export class DeleteGroupRes extends HttpApiResponse {

  @ApiProperty({example: 'group delete success'})
  public message: string;

}

export class UpdateGroupRes extends CreateGroupRes {

  @ApiProperty({example: 'group update success'})
  public message: string;

}


export class UpdateMemberBody extends GroupId {

  @ApiProperty({example: anUser._id})
  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

}

export class UpdateMemberRes extends HttpApiResponse {

  @ApiProperty({example: 'member update success'})
  public message: string;

}
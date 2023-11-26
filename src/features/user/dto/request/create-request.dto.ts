import { ApiProperty } from "@nestjs/swagger";
import { anUser } from "../user/user.example";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";
import { aGroupRequest, aRequest } from "./request.example";
import { aGroup, secondGroup} from '../../../group/dto/group.example'
import { Transform } from "class-transformer";
import { ObjectId } from "../../../../shared/mongoose/object-id";
import { IsNotEmpty } from "class-validator";

export class UserId {
  
  @ApiProperty({example: anUser._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;

}

export class CreateFriendRequestRes extends HttpApiResponse {

  @ApiProperty({example: 'friend request created'})
  public message: string;

  @ApiProperty({example: aRequest})
  public data: any;

}

export class GroupId {
  
  @ApiProperty({example: secondGroup._id})
  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;

}

export class CreateGroupRequestRes extends HttpApiResponse {

  @ApiProperty({example: 'group request created'})
  public message: string;

  @ApiProperty({example: aGroupRequest})
  public data: any;

}

export class CreateGroupInvitationBody {

  @ApiProperty({example: anUser._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  id: ObjectId;
    
  @ApiProperty({example: aGroup._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;

  
}

export class CreateGroupInvitationRes extends HttpApiResponse {

  @ApiProperty({example: 'group invitation sent'})
  public message: string;

}
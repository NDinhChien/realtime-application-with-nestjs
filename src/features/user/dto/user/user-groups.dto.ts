import { ApiProperty } from "@nestjs/swagger";
import { aGroup } from "../../../group/dto/group.example";
import { anUser, secondUser } from "./user.example";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";
import { Transform } from "class-transformer";
import { ObjectId,  } from "../../../../shared/mongoose/object-id";
import { IsNotEmpty } from "class-validator";

export class AcceptGroupRequestBody {
  
  @ApiProperty({example: aGroup._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  groupId: ObjectId;

  @ApiProperty({example: anUser._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  from: ObjectId;

}

export class AddNewMemberRes extends HttpApiResponse {

  @ApiProperty({ example: 'member add success'})
  public message: string;

}

export class RemoveGroupRes extends HttpApiResponse {

  @ApiProperty({type: 'group remove success'})
  public message: string;

}

export class UpdateGroupInfoRes extends HttpApiResponse {

  @ApiProperty({example: 'group info update success'})
  public message: string;

}
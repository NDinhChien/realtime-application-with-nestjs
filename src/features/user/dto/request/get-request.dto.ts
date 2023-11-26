import { ApiParamOptions, ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";
import { aGroupInvitation, aGroupRequest, aRequest } from "./request.example";
import { thirdUser } from "../user/user.example";
import { Transform } from "class-transformer";
import { ObjectId,  } from "../../../../shared/mongoose/object-id";
import { IsNotEmpty } from "class-validator";

export class GetRequestsRes extends HttpApiResponse {

  @ApiProperty({example: 'requests get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [aRequest, aGroupRequest, aGroupInvitation]})
  public data: any;

}

export class GetFriendRequestsRes extends HttpApiResponse {
  @ApiProperty({example: 'friend requests to me'})
  public message: string;

  @ApiProperty({isArray: true, example: [aRequest]})
  public data: any;
}

export class GetGroupRequestsRes extends HttpApiResponse {
  @ApiProperty({example: 'group requests to me'})
  public message: string;

  @ApiProperty({isArray: true, example: [aGroupRequest]})
  public data: any;
}

export class GetGroupInvitationsRes extends HttpApiResponse {
  @ApiProperty({example: 'group invitations to me'})
  public message: string;

  @ApiProperty({isArray: true, example: [aGroupInvitation]})
  public data: any;
}


export class GetRequestsToMeRes extends GetRequestsRes {
  @ApiProperty({isArray: true, example: [{...aRequest, to: thirdUser._id,}, {...aGroupRequest, to: thirdUser._id,}, {...aGroupInvitation, to: thirdUser._id,}]})
  public data: any;
}

export const RequestIdParam: ApiParamOptions = {
  name: 'requestId',
  type: String,
  required: true,
}
export class RequestId {

  @ApiProperty({example: aRequest._id})

  @IsNotEmpty()
  @Transform(({value}) => new ObjectId(value))
  requestId: ObjectId;

}
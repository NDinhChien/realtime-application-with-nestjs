import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../schema/user.schema";
import { Param, Body, Controller, HttpStatus, Get,Post, Delete,
  ForbiddenException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CoreApiResponse } from "../../../shared/core/CoreApiResponse";
import { RequestService } from "../service/request.service";
import { Request } from "../schema/request.schema";
import { CreateFriendRequestRes, CreateGroupInvitationBody, CreateGroupInvitationRes, CreateGroupRequestRes, GroupId, UserId } from "../dto/request/create-request.dto";

import { DeleteRequestRes } from "../dto/request/delete-request.dto";
import { GetFriendRequestsRes, GetGroupInvitationsRes, GetGroupRequestsRes, GetRequestsRes, GetRequestsToMeRes, RequestId, RequestIdParam } from "../dto/request/get-request.dto";
import { JwtAuth } from "../../auth/decorators/jwt-auth.decorator";
import { isEqual } from "../../../shared/mongoose/isEqual";

/*
DEL  request/id/:id                                        v

POST request/friend-request         { id }                 v   
POST request/group-request          { groupId }            v   
POST request/group-invitation       { id, groupId }        v    

GET  request/all                                           v
GET  request/request-to-me/all                             v   
GET  request/friend-request-to-me                          v
GET  request/group-request-to-me                           v
GET  request/group-invitation-to-me                        v
*/

@JwtAuth()
@ApiBearerAuth()
@ApiTags('request')
@Controller('request')
export class RequestController {

  constructor(
    private requestService: RequestService,
  ) {}

  @ApiResponse({type: DeleteRequestRes})
  @ApiParam(RequestIdParam)
  @Delete('id/:requestId')
  async deleteRequestById(
    @CurrentUser() user: User,
    @Param() param: RequestId
  ): Promise<CoreApiResponse<null>> {
    const request = await this.requestService.validateRequest(param.requestId);
    
    if (!isEqual(request.from, user._id)) {
      throw new ForbiddenException('You are not owner of this request');
    }
    
    await this.deleteRequest(request._id);
    return CoreApiResponse.new(HttpStatus.OK, 'request delete success', null);
  }

  @ApiResponse({type: CreateFriendRequestRes})
  @ApiBody({type: UserId})
  @Post('friend-request')
  async createFriendRequest(
    @CurrentUser() me: User,
    @Body() body: UserId, 
  ): Promise<CoreApiResponse<Request>> {
    return CoreApiResponse.new(HttpStatus.OK, 'friend request created', 
      await this.requestService.createFriendRequest(
        me,
        body.id,
      )
    )
  }

  @ApiResponse({type: CreateGroupRequestRes})
  @ApiBody({type: GroupId})
  @Post('group-request')
  async createGroupRequest(
    @CurrentUser() me: User,
    @Body() body: GroupId, 
  ): Promise<CoreApiResponse<Request>> {

    return CoreApiResponse.new(HttpStatus.OK, 'group request created', 
      await this.requestService.createGroupRequest(
        me,
        body.groupId,
      )
    )
  }

  @ApiResponse({type: CreateGroupInvitationRes})
  @ApiBody({type: CreateGroupInvitationBody})
  @Post('group-invitation')
  async createGroupInvitation(
    @CurrentUser() me: User,
    @Body() body: CreateGroupInvitationBody,
  ): Promise<CoreApiResponse<Request>> {
    return CoreApiResponse.new(HttpStatus.OK, 'group invitation sent', 
      await this.requestService.createGroupInvitation(me, body.id, body.groupId)
    )
  }

  async deleteRequest(request: Request) {
    return await this.requestService.deleteRequest(request._id)
  }
  @ApiResponse({type: GetRequestsRes})
  @Get('all')
  async getRequests(
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<Request[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'requests get success', 
      await this.requestService.getRequests(me)
    )
  }

  @ApiResponse({type: GetRequestsToMeRes})
  @Get('request-to-me/all')
  async getRequestsToMe(
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<Request[]>> { 
    return CoreApiResponse.new(HttpStatus.OK, 'requests get success', 
      await this.requestService.getRequestsToMe(me),
    )
  }

  @ApiResponse({type: GetFriendRequestsRes})
  @Get('friend-request-to-me')
  async getFriendRequestsToMe(
    @CurrentUser() me: User
  ): Promise<CoreApiResponse<Request[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'friend requests to me', 
      await this.requestService.getFriendRequestsToMe(me)
    );
  }

  @ApiResponse({type: GetGroupRequestsRes})
  @Get('group-request-to-me')
  async getGroupRequestsToMe(
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<Request[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'group requests to me', 
      await this.requestService.getGroupRequestsToMe(me)
    );
  }

  @ApiResponse({type: GetGroupInvitationsRes})
  @Get('group-invitation-to-me')
  async getGroupInvitationsToMe(
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<Request[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'group invitations to me', 
      await this.requestService.getGroupInvitationsToMe(me)
    )
  }

}
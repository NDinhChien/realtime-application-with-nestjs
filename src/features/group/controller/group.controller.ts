import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Query
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/schema/user.schema';
import { GroupService } from '../service/group.service';
import { Group } from '../schema/group.schema';
import { SubGroup } from '../../user/schema/sub.schema';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreApiResponse } from '../../../shared/core/CoreApiResponse';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { GroupId } from '../../user/dto/request/create-request.dto';
import { GroupIdQuery, LimitQuery } from '../../message/dto/fetch-messages.dto';
import { PageQuery } from '../../user/dto/user/get-user.dto';
import { GetGroupRes, GetGroupsRes, GetMembersRes, GroupIdParam, IsPublicQuery, KeywordQuery, SearchGroupsQuery, SearchGroupsRes } from '../dto/get-groups.dto';
import { JoinPublicGroupRes } from '../dto/join-group.dto';
import { CreateGroupBody, CreateGroupRes, DeleteGroupRes, UpdateGroupRes, UpdateMemberBody, UpdateMemberRes } from '../dto/update-group.dto';

/*
GET  group/id/:groupId
GET  group/search?keyword=&limit=&page=&public= v
POST group/join { groupId }      v

GET  group/my                   v
PUT  group/id/:groupId          v
DEL  group/id/:groupId          v 

GET  group/members?groupId=     v
PUT  group/member {groupId, id}
POST group                      v

*/

@ApiTags('group')
@Controller('group')
export class GroupController {
  
  constructor(private groupService: GroupService) {}

  @ApiResponse({type: SearchGroupsRes})
  @ApiQuery(PageQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(KeywordQuery)
  @ApiQuery(IsPublicQuery)
  @Get('search')
  async searchGroups(
    @Query() query: SearchGroupsQuery,
  ): Promise<CoreApiResponse<Group[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'groups search success',
      await this.groupService.searchGroups(query.keyword, query.limit, query.page, query.isPublic)
    )
  }
  
  @ApiParam(GroupIdParam)
  @ApiResponse({type: GetGroupRes})
  @Get('id/:groupId')
  async get(
    @Param() param: GroupId,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<Group>> {

    const group = await this.groupService.getGroup(param.groupId, this.groupService.publicFields);
    if (!group) {
      throw new NotFoundException('Group does not exist');
    }
    return CoreApiResponse.new(HttpStatus.OK, 'group get success', group);
  }

  @ApiBearerAuth()
  @JwtAuth()  
  @ApiBody({type: GroupId})
  @ApiResponse({type: JoinPublicGroupRes})
  @Post('join')
  async joinPublicGroup(
    @CurrentUser() me: User,
    @Body() body: GroupId,
  ): Promise<CoreApiResponse<any>> {
    const group = await this.groupService.validateGroup(body.groupId, '-members');
    if (!group.isPublic) {
      throw new BadRequestException('This group is not a public one.')
    }
    if (me.isMember(group._id)) {
      throw new BadRequestException('You are already a member of this group.')
    }
    
    await this.groupService.addGroup(group, me);
    return CoreApiResponse.new(HttpStatus.OK, 'public group join success', this.groupService.filterGroup(group));
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: CreateGroupRes})
  @ApiBody({type: CreateGroupBody})
  @Post()
  async create(
    @Body() group: CreateGroupBody, 
    @CurrentUser() user: User
  ): Promise<CoreApiResponse<Group>> { 
    return CoreApiResponse.new(HttpStatus.OK, 'group create success', 
      this.groupService.filterGroup(
        await this.groupService.create(group, user)
      ));
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetGroupsRes})
  @Get('my')
  async getGroups(@CurrentUser() me: User): Promise<CoreApiResponse<SubGroup[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'groups get success', me.groups);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetMembersRes})
  @ApiQuery(GroupIdQuery)
  @Get('members')
  async getGroupMembers(
    @CurrentUser() me: User,
    @Query() query: GroupId,
  ): Promise<CoreApiResponse<any>> {
    if (!me.isMember(query.groupId)) {
      throw new ForbiddenException('Your are not a member of this group')
    }
    
    const members = (await this.groupService.validateGroup(query.groupId, 'members')).members;
    return CoreApiResponse.new(HttpStatus.OK, 'members get success', {
      group: query.groupId, members
    })
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: UpdateMemberRes})
  @ApiBody({type: UpdateMemberBody})
  @Put('member')
  async updateMember(
    @CurrentUser() me: User,
    @Body() body: UpdateMemberBody,
  ) {
    await this.groupService.updateMember(body.groupId, me, body.id);
    return CoreApiResponse.new(HttpStatus.OK, 'member update success', null);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: UpdateGroupRes})
  @ApiBody({type: CreateGroupBody})
  @ApiParam(GroupIdParam)
  @Put('id/:groupId')
  async update(
    @Param() param: GroupId,
    @Body() body: CreateGroupBody,
    @CurrentUser() user: User,
  ): Promise<CoreApiResponse<Group>> {

    return CoreApiResponse.new(HttpStatus.OK, 'group update success', 
      await this.groupService.update(param.groupId, body, user,)
    ) 
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: DeleteGroupRes})
  @ApiParam(GroupIdParam)
  @Delete('id/:groupId')
  async delete(
    @Param() param: GroupId,
    @CurrentUser() user: User,
  ): Promise<CoreApiResponse<any>> {
    await this.groupService.delete(user, param.groupId)
    return CoreApiResponse.new(HttpStatus.OK, 'group delete success', null)
  }

}

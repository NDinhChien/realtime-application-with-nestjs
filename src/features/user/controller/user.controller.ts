import { Controller, Get, Param, Query, HttpStatus, Put, Body,
  BadRequestException,
  ForbiddenException,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiBody, ApiTags, ApiResponse, ApiQuery, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { GetUserRes, LimitQuery, PageQuery, SearchUsersQuery, SearchUsersRes, UserIdParam, Username, UsernameParam, UsernameQuery } from '../dto/user/get-user.dto';
import { CoreApiResponse } from '../../../shared/core/CoreApiResponse';
import { User } from '../schema/user.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GetOwnedGroupsRes, UpdateUserRes, UpdateUsernameBody } from '../dto/user/user-profile.dto';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { GroupId, UserId } from '../dto/request/create-request.dto';
import { RequestService } from '../service/request.service';
import { AcceptFriendRes, RemoveFriendRes, UpdateFriendRes } from '../dto/user/user-friends.dto';
import { GetFriendsRes, GetProfileRes } from '../dto/user/user-profile.dto';
import { Request, RequestType } from '../schema/request.schema';
import { GroupService } from '../../group/service/group.service';
import { AcceptGroupRequestBody, AddNewMemberRes, RemoveGroupRes, UpdateGroupInfoRes } from '../dto/user/user-groups.dto';
import { SubGroup, SubUser } from '../schema/sub.schema';
import { CodeService } from '../service/code.service';
import { ACode, CodeParam, RecoverPasswordBody, RecoverPasswordRes, UpdatePasswordBody, UpdatePasswordRes } from '../dto/user/user-password.dto';
import { AvatarInterceptor } from '../../../shared/interceptor/local-files-interceptor';
import { CreateMediaPayload, MediaService } from '../../media/service/media.service';
import { MediaType } from '../../media/schema/media.schema';
import { UploadAvatarBody, UploadAvatarRes } from '../dto/user/user-avatar.dto';
import { GetGroupsRes } from '../../group/dto/get-groups.dto';
/*

GET  user/search?username=&limit=&page= v
GET  user/username/:username            v
GET  user/id/:id                        v
GET  user/profile                       v

PUT  user/friend     { id }              v
PUT  user/group      { groupId }         v 
PUT  user/avatar                         v

PUT  user/username                      v
PUT  user/password                      v
POST user/password/:code                v

GET  user/groups/my                  v
GET  user/groups/owned               v
GET  user/friends                    v
DEL  user/remove-friend { id }       v
DEL  user/remove-group  { groupId }  v

PUT  user/accept-friend-request   { id }                 v
PUT  user/accept-group-request    { id, groupId }        v           
PUT  user/accept-group-invitation { from, to, groupId }  v      
  
*/
@ApiTags('user')
@Controller('user')
export class UserController {

  constructor(
    private userService: UserService,
    private requestService: RequestService,  
    private groupService: GroupService,
    private codeService: CodeService,
    private mediaService: MediaService,
  ) {}

  @ApiResponse({ type: RecoverPasswordRes})
  @ApiBody({ type: RecoverPasswordBody })
  @ApiParam(CodeParam)
  @Post('password/:code')
  async recoverPassword(
    @Param() param: ACode,
    @Body() body: RecoverPasswordBody,
  ): Promise<CoreApiResponse<any>> {
    const acode = await this.codeService.validateByCode(param.code);

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException(`Passwords does not match`);
    }

    const user = await this.userService.validateUserByEmail(acode.email, this.userService.fields('password'));

    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;
    await user.save();

    await this.codeService.delete(acode.email);

    return CoreApiResponse.new(HttpStatus.OK, 'password recover success', null);
  }

  @Get('search')
  @ApiQuery(PageQuery)
  @ApiQuery(LimitQuery)
  @ApiQuery(UsernameQuery)
  @ApiResponse({type: SearchUsersRes})
  async searchUsers(
    @Query() query: SearchUsersQuery,
  ): Promise<CoreApiResponse<User[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'users search success',
      await this.userService.searchUsersLike(query.username, query.limit, query.page)
    )
  }

  @ApiParam(UsernameParam)
  @ApiResponse({ type: GetUserRes })
  @Get('username/:username')
  async getUser(@Param() param: Username): Promise<CoreApiResponse<User>> {
    return CoreApiResponse.new(HttpStatus.OK, 'user get success',
      await this.userService.validateUserByName(param.username, this.userService.publicFields, true) 
    )
  }

  @ApiResponse({ type: GetUserRes })
  @ApiParam(UserIdParam)
  @Get('id/:id')
  async getUserById(@Param() param: UserId): Promise<CoreApiResponse<User>> {
    return CoreApiResponse.new(HttpStatus.OK, 'user get success', 
      await this.userService.validateUserById(param.id, this.userService.publicFields, true)
    )
  }
  
  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetProfileRes})
  @Get('profile')
  myProfile(
    @CurrentUser() me: User,
  ): CoreApiResponse<User> {
    return CoreApiResponse.new(HttpStatus.OK, 'profile get success', this.getUserProfile(me)
    )
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseInterceptors(AvatarInterceptor)
  @ApiResponse({type: UploadAvatarRes})
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: UploadAvatarBody})
  @Put('avatar')
  async uploadAvatar(
    @CurrentUser() me: User,
    @UploadedFile() file: Express.Multer.File,
  ) {

    const payload: CreateMediaPayload = {
      size: file.size,
      owner: me._id,
      name: file.filename,
      type: MediaType.AVATAR,
    }
    
    await this.mediaService.createAvatar(payload);

    return CoreApiResponse.new(HttpStatus.OK, 'avatar upload success', null)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({ type: UpdateUserRes })  
  @ApiBody({ type: UpdateUsernameBody })
  @Put('username')
  async updateUsername(
    @CurrentUser() user: User,
    @Body('username') username: string,
  ): Promise<CoreApiResponse<User>> {
     
    const usernameUser = await this.userService.getUserByName(username, '_id');

    if (usernameUser) {
      throw new BadRequestException('Username already exists');
    }

    user.username = username;

    return CoreApiResponse.new(HttpStatus.OK, 'user update success', this.getUserProfile(await user.save()));
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: UpdatePasswordRes})
  @ApiBody({type: UpdatePasswordBody})
  @Put('password')
  async updatePassword(
    @CurrentUser() me: User,
    @Body() body: UpdatePasswordBody,
  ): Promise<CoreApiResponse<any>> {
    if (me.isSocial()) {
      throw new ForbiddenException('User is social one.')
    }
    if (! await me.validatePassword(body.currentPassword)) {
      throw new BadRequestException('Current password does not match');
    }
    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords does not match');
    }
    if (await me.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    me.password = body.password;
    await this.userService.resetUserSession(me);

    return CoreApiResponse.new(HttpStatus.OK, 'password update success', null);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: UpdateFriendRes})
  @ApiBody({type: UserId})
  @Put('friend')
  async updateFriend(
    @CurrentUser() me: User,
    @Body() body: UserId
  ): Promise<CoreApiResponse<any>> {
    await this.userService.updateFriend(me, body.id);
    return CoreApiResponse.new(HttpStatus.OK, 'friend update success', null)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: UpdateGroupInfoRes})
  @ApiBody({type: GroupId})
  @Put('group')
  async updateGroup(
    @CurrentUser() me: User,
    @Body() body: GroupId,
  ): Promise<CoreApiResponse<any>> {
    await this.userService.updateGroup(me, body.groupId);
    return CoreApiResponse.new(HttpStatus.OK, 'group info update success', null);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetOwnedGroupsRes})
  @Get('groups/owned')
  getOwnedGroups(
    @CurrentUser() me: User,
  ): CoreApiResponse<SubGroup[]> {
    return CoreApiResponse.new(HttpStatus.OK, 'owned groups get success', me.myGroups())
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetGroupsRes})
  @Get('groups/my')
  getMyGroups(
    @CurrentUser() me: User,
  ): CoreApiResponse<SubGroup[]> {
    return CoreApiResponse.new(HttpStatus.OK, 'groups get success', me.groups)
  }
  
  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: GetFriendsRes})
  @Get('friends')
  async myFriends(
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<SubUser[]>> {
    return CoreApiResponse.new(HttpStatus.OK, 'friends get success', await this.getFriends(me))
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: RemoveFriendRes})
  @ApiBody({type: UserId})
  @Delete('remove-friend')
  async removeFriend(
    @Body() body: UserId,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<any>> {
    if (!await this.userService.isFriend(me, body.id)) {
      throw new BadRequestException('This user is not your friend currently.')
    }

    const friend = await this.userService.validateUserById(body.id, this.userService.publicFields, true)
    await this.userService.removeFriend(me, friend)
    return CoreApiResponse.new(HttpStatus.OK, 'friend remove success', friend)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: AcceptFriendRes})
  @ApiBody({type: UserId })
  @Put('accept-friend-request')
  async acceptFriendRequest(
    @CurrentUser() me: User,
    @Body() body: UserId,
   ) {
    const request = await this.requestService.validateRequestBy({
      from: body.id, 
      to: me._id, 
      type: RequestType.FRIEND
    });
    const friend =  await this.userService.validateUserById(body.id, this.userService.publicFields, true)
    await this.userService.addFriend(me, friend);
    await this.deleteRequest(request);
    
    return CoreApiResponse.new(HttpStatus.OK, 'friend add success', friend)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiResponse({type: RemoveGroupRes})
  @ApiBody({type: GroupId})
  @Delete('remove-group')
  async removeGroup(
    @Body() body: GroupId,
    @CurrentUser() me: User,
  ): Promise<CoreApiResponse<any>> {
    if (!me.isMember(body.groupId)) {
      throw new BadRequestException('You are not a member of this group.')
    }

    const group = await this.groupService.validateGroup(body.groupId, '-members');
    await this.groupService.removeGroup(me, group);
    return CoreApiResponse.new(HttpStatus.OK, 'group remove success', null)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @ApiBody({type: AcceptGroupRequestBody})
  @ApiResponse({type: AddNewMemberRes})
  @Put('accept-group-request')
  async acceptGroupRequest(
    @CurrentUser() me: User,
    @Body() body: AcceptGroupRequestBody,
  ) {
    const request = await this.requestService.validateRequestBy({
      from: body.from,
      group: body.groupId,
      type: RequestType.GROUP,
    })
    const group = await this.groupService.validateGroupByIdAndOwner(body.groupId, me._id, '-members'); 
    const member = await this.userService.validateUserById(body.from, this.userService.fields('groups'));

    await this.groupService.addGroup(group, member);
    await this.deleteRequest(request);
    return CoreApiResponse.new(HttpStatus.OK, 'member add success', null);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Put('accept-group-invitation')
  @ApiBody({type: GroupId})
  @ApiResponse({type: AddNewMemberRes})
  async acceptGroupInvitation(
    @CurrentUser() me: User,
    @Body() body: GroupId
  ) {
    const request = await this.requestService.validateRequestBy({
      to: me._id,
      group: body.groupId,
      type: RequestType.INVITATION,
    })
    const group = await this.groupService.validateGroupByIdAndOwner(body.groupId, request.from, '-members');

    await this.groupService.addGroup(group, me);
    await this.deleteRequest(request)
    return CoreApiResponse.new(HttpStatus.OK, 'group member add', null);
  }

  getPublicProfile(user: User) {
    return this.userService.filterUser(user)
  }

  getUserProfile(user: User) {
    return this.userService.filterUser(user, this.userService.fields('email'));
  }

  async getFriends(user: User): Promise<SubUser[]> {
    return (await this.userService.validateUserById(user._id, 'friends', true)).friends;
  }

  async deleteRequest(request: Request) {
    await this.requestService.deleteRequest(request._id);
  }

}

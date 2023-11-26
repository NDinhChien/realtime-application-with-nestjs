import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schema/user.schema";
import { Request, RequestType } from "../schema/request.schema";
import { FilterQuery, Model } from "mongoose";
import { GroupService } from "../../group/service/group.service";
import { UserService } from "./user.service";
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { remove } from "../../../shared/utils/remove";
import { UserConfig } from "../user.config";
import { ObjectId } from "../../../shared/mongoose/object-id";
import { isEqual } from "../../../shared/mongoose/isEqual";

export class RequestService {
  
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    private userService: UserService,
    private groupService: GroupService,
  ) {}

  async validateRequest(id: ObjectId): Promise<Request> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new NotFoundException('Request does not exist.');
    } 
    return request;
  }

  async getRequest(id: ObjectId): Promise<Request|null> {
    return await this.requestModel.findOne({
      ...this.getExpirationFilter(),
      _id: id
    }).lean();
  }

  async validateRequestBy(filter: FilterQuery<Request>): Promise<Request> {
    const request = await this.getRequestBy(filter);
    if (!request) {
      throw new NotFoundException('Request does not exist.')
    }
    return request;
  }

  async getRequestBy(filter: FilterQuery<Request>) 
  : Promise<Request|null> {
    return await this.requestModel.findOne({
      ...this.getExpirationFilter(),
      ...filter,
    }).lean()
  }

  async getRequestsBy(filter: FilterQuery<Request>) 
  : Promise<Request[]> {

    return await this.removeExpired(
      await this.requestModel
      .find(filter)
      .sort({createdAt: -1})
      .lean()
    )

  }

  async getRequests(me: User): Promise<Request[]> {

    const filter: FilterQuery<Request> = {
      from: me._id,
    }
    return await this.getRequestsBy(filter);

  }
  
  async getFriendRequests(me: User): Promise<Request[]> {
    const filter: FilterQuery<Request> = {
      from: me._id,
      type: RequestType.FRIEND,
    }

    return await this.getRequestsBy(filter)
  }

  async getGroupRequests(me: User): Promise<Request[]> {
    const filter: FilterQuery<Request> = {
      from: me._id,
      type: RequestType.GROUP,
    }

    return await this.getRequestsBy(filter)
  }

  async getGroupInvitation(me: User): Promise<Request[]> {
    const filter: FilterQuery<Request> = {
      from: me._id,
      type: RequestType.INVITATION,
    }

    return await this.getRequestsBy(filter)
  }

  
  async getGroupInvitationsToMe(me: User): Promise<Request[]> {
    const filter: FilterQuery<Request> = {
      to: me._id,
      type: RequestType.INVITATION,
    }

    return await this.getRequestsBy(filter);
  }

  async getFriendRequestsToMe(me: User) {
    const filter: FilterQuery<Request> = {
      to: me._id,
      type: RequestType.FRIEND,
    }

    return await this.getRequestsBy(filter)
  }

  async getGroupRequestsToMe(me: User): Promise<Request[]> {

    const filter: FilterQuery<Request> = {
      to: me._id,
      type: RequestType.GROUP,
    }
    return await this.getRequestsBy(filter);
  }

  async getRequestsToMe(me: User): Promise<Request[]> {

    return await this.getRequestsBy({to: me._id})
    
  }

  async deleteRequest(id: ObjectId): Promise<any> {
    return await this.requestModel.deleteOne({_id: id});
  }

  
  async deleteRequests(me: User): Promise<any> {
    const filter: FilterQuery<Request> = {
      from: me._id,
    }
    return await this.requestModel.deleteMany(filter);
  }

  async deleteRequestsToMe(me: User): Promise<any> {
    const groups = me.myGroups().map(grp => grp._id);
    const filter: FilterQuery<Request> = {
      $or: [
        {
          group: {
            $in: groups, 
          }
        },
        {
          to: me._id,
        }
      ]
    }
    return await this.requestModel.deleteMany(filter);

  }

  async createFriendRequest(from: User, id: ObjectId): Promise<Request> {
    if (isEqual(from._id, id)) {
      throw new BadRequestException('You can not make friend request to yourself');
    }
    if (await this.userService.isFriend(from, id)) {
      throw new BadRequestException('This user is your friend already.')
    }

    const to = await this.userService.validateUserById(id, this.userService.publicFields, true);

    const created = await this.requestModel.findOneAndUpdate({
      from: from._id,
      to: to._id,
      type: RequestType.FRIEND,
    }, {}, { new: true, upsert: true })

    this.userService.sendMessage(from._id, 'friend:request', {to});
    this.userService.sendMessage(to._id, 'friend:request', {from: this.userService.filterUser(from)})
    return created;
  }

  async createGroupRequest(from: User, groupId: ObjectId): Promise<Request> {
    const group = await this.groupService.validateGroup(groupId, this.groupService.publicFields);

    if (from.isMember(group._id)) {
      throw new BadRequestException('You are a member of this group already.');
    }
    else if(group.isPublic) {
      throw new BadRequestException('This is a public group, you can join at any time');
    }

    const created = await this.requestModel.findOneAndUpdate({
      from: from._id,
      to: group.owner,
      group: group._id,
      type: RequestType.GROUP,
    }, {}, { new: true, upsert: true })
    
    this.userService.sendMessage(from._id, 'group:request', {group})
    this.userService.sendMessage(group.owner, 'group:request', {
      from: this.userService.filterUser(from), 
      group,
    })

    return created;
  }

  async createGroupInvitation(from: User, id: ObjectId, groupId: ObjectId): Promise<Request> {
    if (isEqual(from._id, id)) {
      throw new BadRequestException('You can not invite yourself to a group.');
    }
    if (!from.isOwner(groupId)) {
      throw new ForbiddenException('You are not owner of this group');
    }

    const to = await this.userService.validateUserById(id, this.userService.publicFields, true);
    const group = await this.groupService.validateGroup(groupId, this.groupService.publicFields);
    const created = await this.requestModel.findOneAndUpdate({
      from: from._id,
      to: to._id,
      group: group._id,
      type: RequestType.INVITATION,
    }, {}, { new: true, upsert: true});

    this.userService.sendMessage(from._id, 'group:invitation', {to, group})
    this.userService.sendMessage(to._id, 'group:invitation', {from: this.userService.filterUser(from), group})
    
    return created;
  }

  async getExpirationFilter() {
    return { updatedAt: { $gte: new Date(Date.now() - UserConfig.requestExpiration) }};
  }
  
  async removeExpired(requests: Request[]) {
    const removed = remove(requests, (req) => req.createdAt.getTime()+ UserConfig.requestExpiration < Date.now());
    
    removed.forEach(async req => await this.deleteRequest(req._id));

    return requests;
  }
}
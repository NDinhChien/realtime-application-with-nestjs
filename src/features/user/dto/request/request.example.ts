import { RequestType } from "../../schema/request.schema";
import { anUser, secondUser } from "../user/user.example";
import { aGroup, secondGroup } from "../../../group/dto/group.example";

export const aRequest = {
  _id: 'aaabbbcccdddeeefff12345',
  from: anUser._id,
  to: secondUser._id,
  type: RequestType.FRIEND,
}

export const aGroupRequest = {
  _id: 'eeefff12345aaabbbcccddd',
  from: anUser._id,
  group: secondGroup._id,
  type: RequestType.GROUP,
}

export const aGroupInvitation = {
  _id: 'eeefffcccddd12345aaabbb',
  from: anUser._id,
  to: secondUser._id,
  group: aGroup._id,
  type: RequestType.INVITATION,
}
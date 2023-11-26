import { ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse"
import { aProfile, anUser, fourthUser, secondUser, thirdUser } from "./user.example";
import { aGroup, secondGroup } from '../../../group/dto/group.example'

export class GetProfileRes extends HttpApiResponse {

  @ApiProperty({example: 'profile get success'})
  public message: string;

  @ApiProperty({example: {...anUser, email: aProfile.email}})
  public data: any;
}

export class GetOwnedGroupsRes extends HttpApiResponse {
  @ApiProperty({example: 'owned groups get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [aGroup, secondGroup]})
  public data: any;
}

export class GetFriendsRes extends HttpApiResponse {
  @ApiProperty({example: 'friends get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [secondUser]})
  public data: any;
}

import { IsString, Matches,
  MaxLength,
  MinLength, } from 'class-validator';
import { usernameRegExp } from '../../schema/user.schema';

export class UpdateUsernameBody {

  @ApiProperty({example: anUser.username})
  @Matches(usernameRegExp, {
    message: 'Invalid username',
  })
  username: string;

}

export class UpdateUserRes extends HttpApiResponse {
  @ApiProperty({example: 'username update success'})
  public message: string;

  @ApiProperty({example: {...anUser, email: aProfile.email} })
  public data: any;

}

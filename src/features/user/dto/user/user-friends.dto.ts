import { ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";
import { ObjectId } from "../../../../shared/mongoose/object-id";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { usernameRegExp } from "../../schema/user.schema";

export class AcceptFriendRes extends HttpApiResponse {

  @ApiProperty({example: 'friend add success'})
  public message: string;

}

export class RemoveFriendRes extends HttpApiResponse {

  @ApiProperty({example: 'friend remove success'})
  public message: string;

}

export class UpdateFriendRes extends HttpApiResponse {

  @ApiProperty({example: 'friend update success'})
  public message: string;

}
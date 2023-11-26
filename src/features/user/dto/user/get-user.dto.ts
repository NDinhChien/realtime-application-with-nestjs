import { IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { ApiParamOptions, ApiProperty, ApiQueryOptions} from '@nestjs/swagger'
import { HttpApiResponse } from "../../../../shared/core/CoreApiResponse";
import { usernameRegExp } from "../../schema/user.schema";
import { Transform, Type } from "class-transformer";
import { anUser, secondUser, thirdUser } from "./user.example";


export class GetUserBody {

  @ApiProperty({ example: anUser.username })
  @Matches(usernameRegExp, {
    message: 'Invalid username',
  })
  @IsString()
  username: string;

}

export class GetUserRes extends HttpApiResponse {
  @ApiProperty({example: 'user get success'})
  public message: string;

  @ApiProperty({example: anUser})
  public data: any;
}
export class Username {

  @Matches(usernameRegExp, {
    message: 'Invalid username',
  })
  @IsString()
  username: string;

}
export const UsernameParam: ApiParamOptions = {
  name: 'username',
  type: String,
  required: true,
  example: anUser.username,
}

export const UserIdParam: ApiParamOptions = {
  name: 'id',
  type: String,
  required: true,
}

export const LimitQuery: ApiQueryOptions = {
  name: 'limit',
  type: Number,
  required: false,
}

export const PageQuery: ApiQueryOptions = {
  name: 'page',
  type: Number,
  required: false,
}

export class SearchUsersQuery {

  @Matches(usernameRegExp, {
    message: 'Invalid username',
  })
  username: string;

  @IsOptional()
  @Min(0)
  @IsNumber()
  @Type(()=>Number)
  page?: number;

  @IsOptional()
  @Min(1)
  @IsNumber()
  @Type(()=>Number)
  limit?: number;

}

export class SearchUsersRes extends HttpApiResponse {

  @ApiProperty({example: 'user search success'})
  public message: string;

  @ApiProperty({isArray: true, example: [anUser, secondUser, thirdUser]})
  public data: any;

}

export const UsernameQuery: any = UsernameParam;
export const UserIdQuery: any = UserIdParam;

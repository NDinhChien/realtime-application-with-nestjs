import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';
import { ApiParamOptions, ApiProperty, ApiQueryOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { aGroup, anUser, secondGroup, secondUser, thirdUser } from './group.example';

export const GroupIdParam: ApiParamOptions = {
  type: String,
  name: 'groupId',
  required: true,
}

export const KeywordQuery: ApiQueryOptions = {
  name: 'keyword',
  type: String,
  required: true,
}

export const IsPublicQuery: ApiQueryOptions = {
  name: 'isPublic',
  type: String,
  required: false,
}

export class SearchGroupsQuery {

  @MaxLength(25)
  @MinLength(5)
  @IsString()
  keyword: string;

  @IsOptional()
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;
}

export class SearchGroupsRes extends HttpApiResponse {
  
  @ApiProperty({example: 'groups search success'})
  public message: string;

  @ApiProperty({isArray: true, example: [aGroup, secondGroup]})
  public data: any;

}

export class GetMembersRes extends HttpApiResponse {

  @ApiProperty({example: 'members get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [anUser, secondUser, thirdUser]})
  public data: any;
  
}


export class GetGroupRes extends HttpApiResponse {

  @ApiProperty({example: 'group get success'})
  public message: string;

  @ApiProperty({example: aGroup})
  public data: any;

}

export class GetMyGroupsRes extends HttpApiResponse {

  @ApiProperty({example: 'my groups get success'})
  public message: string;

  @ApiProperty({isArray: true, example: [aGroup]})
  public data: any;

}

export class GetPublicGroupsRes extends GetMyGroupsRes {

  @ApiProperty({example: 'public groups get success'})
  public message: string;

}

export class GetGroupsRes extends GetGroupRes {

  @ApiProperty({example: 'groups get success'})
  public message: string;

}


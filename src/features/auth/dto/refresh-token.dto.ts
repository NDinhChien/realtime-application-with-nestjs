import { ApiProperty } from "@nestjs/swagger";
import { HttpApiResponse } from "../../../shared/core/CoreApiResponse";
import { IsString } from "class-validator";

export class RefreshTokenBody {

  @ApiProperty({example: 'a refresh token'})
  @IsString()
  refreshToken: string;

}

export class RefreshTokenRes extends HttpApiResponse {

  @ApiProperty({example: 'token refresh Success'})
  public message: string;

  @ApiProperty({example: {
    access_token: 'new access token',
    refresh_token: 'new refresh token',
  }})
  public data: any;
}
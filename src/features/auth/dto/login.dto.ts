import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { HttpApiResponse } from '../../../shared/core/CoreApiResponse';

export class LoginBody {
  @ApiProperty({example: 'test@email.com'})
  @IsEmail()
  email: string;

  @ApiProperty({example: '12345678'})
  @MaxLength(60)
  @MinLength(6)
  @IsString()
  password: string;
}

export class ThirdPartyLoginBody {
  
  @ApiProperty({example: 'an access token'})
  @IsString()
  accessToken: string;

}

export class LoginRes extends HttpApiResponse {
 
  @ApiProperty({example: 'login success'})
  public message: string;

  @ApiProperty({example: {
    access_token: 'an access token',
    refresh_token: 'an access token',
  }})
  public data: any;

}

export class FacebookLoginRes extends LoginRes {
  
  @ApiProperty({example: 'facebook login success'})
  public message: string;

}

export class GoogleLoginRes extends LoginRes {

  @ApiProperty({example: 'google login success'})
  public message: string;

}

export class LogoutRes extends HttpApiResponse {

  @ApiProperty({example: 'logout success'})
  public message: string;

}
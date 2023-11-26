import { ApiProperty, ApiQueryOptions } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RefreshTokenRes } from './refresh-token.dto';
import { usernameRegExp } from '../../user/schema/user.schema';
  
  export class RegisterBody {

    @ApiProperty({example: 'helloworld'})
    @Matches(usernameRegExp, {
      message: 'Invalid username',
    })
    @IsString()
    username: string;
  
    @ApiProperty({example: '12345678'})
    @MaxLength(60)
    @MinLength(6)
    @IsString()
    password: string;
  
    @ApiProperty({example: 'test@email.com'})
    @IsEmail()
    email: string;
  }

export class RegisterRes extends RefreshTokenRes {

  @ApiProperty({example: 'register success'})
  public message: string;

}

export const OptionalCodeQuery: ApiQueryOptions = {
  name: 'code',
  required: false,
  type: String,
}

export class OptionalCode {

  @IsOptional()
  @IsString()
  code?: string;

}
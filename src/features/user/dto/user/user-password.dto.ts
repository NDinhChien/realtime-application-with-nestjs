import { ApiParamOptions, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { HttpApiResponse } from '../../../../shared/core/CoreApiResponse';

export class UserEmail {

  @ApiProperty({example: 'test@email.com'})
  @IsEmail()
  email: string;

}

export class ACode {

  @IsString()
  code: string;

}
export const CodeParam: ApiParamOptions = {
  name: 'code',
  type: String,
  required: true,
}

export class RecoverPasswordBody {

  @ApiProperty({example: '00000000'})
  @MaxLength(60)
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({example: '00000000'})
  @IsString()
  confirmPassword: string;

}

export class RecoverPasswordRes extends HttpApiResponse {

  @ApiProperty({example: 'password recovery success'})
  public message: string;

}


export class UpdatePasswordBody {
  @ApiProperty({example: '12345678'})
  @IsString()
  currentPassword: string;

  @ApiProperty({example: '00000000'})
  @MaxLength(60)
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({example: '00000000'})
  @IsString()
  confirmPassword: string;
}

export class UpdatePasswordRes extends HttpApiResponse {

  @ApiProperty({example: 'password update success'})
  public message: string;

}

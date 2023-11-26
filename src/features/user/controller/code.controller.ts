import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CodeService } from '../service/code.service';
import { MailPayload, MailService } from '../../mail/services/mail.service';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEmail } from '../dto/user/user-password.dto';
import { HandleBarService } from '../../../shared/handlebar/handlebar.service';
import { CoreApiResponse } from '../../../shared/core/CoreApiResponse';
import { HttpStatus } from '@nestjs/common';
import { AppConfig } from '../../../app.config';
import { ACodeType, CodeTypeParam, IssueCodeRes } from '../dto/code/issue-code.dto';
import { CodeType } from '../schema/code.schema';

/*
POST code/:type    { email }
*/

@ApiTags('code')
@Controller('code')
export class CodeController {

  constructor(
    private userService: UserService,
    private codeService: CodeService,
    private mailService: MailService,
    private handlerBarService: HandleBarService
  ) {}
  
  @ApiResponse({type: IssueCodeRes})
  @ApiParam(CodeTypeParam)
  @ApiBody({type: UserEmail})
  @Post(':type')
  async issue(
    @Param() param: ACodeType,
    @Body() body: UserEmail,
  ): Promise<CoreApiResponse<any>> {

    const user = await this.userService.getUserByEmail(body.email, this.userService.fields('email'), true);
    if (param.type === CodeType.REGISTER && user) {
      throw new BadRequestException('User already exists')
    }
    else if ( param.type === CodeType.RECOVER && !user) {
      throw new BadRequestException('User does not exist or is an social one.')
    }
    const { code, expiration } = await this.codeService.create(body.email);

    const url = AppConfig.frontEndUrl;

    let payload: MailPayload;
    
    if (param.type === CodeType.RECOVER) {
      payload = {
        to: body.email,
        subject: `Recover password`,
        html: this.handlerBarService.getRecoverHtml({
          code,
          url,
          expiration: expiration.toLocaleString(),
          username: user!.username,
        })
      }
    }
    else if (param.type === CodeType.REGISTER) {
      payload = {
        to: body.email,
        subject: 'Register account',
        html: this.handlerBarService.getRegisterHtml({
          email: body.email,
          code,
          url,
          expiration: expiration.toLocaleString(),
        })
      }
    }
    else {
      throw new BadRequestException('invalid code type')
    }
    this.mailService.sendMail(payload)

    return CoreApiResponse.new(HttpStatus.OK, 'code issue success', {
      instruction: 'Please check your email to proceed',
    })
  }
  
}

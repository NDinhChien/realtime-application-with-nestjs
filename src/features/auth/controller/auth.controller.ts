import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { User } from '../../user/schema/user.schema';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService, TokenResponse } from '../service/auth.service';
import { OptionalCode, OptionalCodeQuery, RegisterBody, RegisterRes } from '../dto/register.dto';
import { FacebookLoginRes, GoogleLoginRes, LoginBody, LoginRes, LogoutRes, ThirdPartyLoginBody } from '../dto/login.dto';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { GoogleAuthService } from '../service/google-auth.service';
import { CoreApiResponse } from '../../../shared/core/CoreApiResponse';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenBody, RefreshTokenRes } from '../dto/refresh-token.dto';
import { JwtAuth } from '../decorators/jwt-auth.decorator';
import { UserService } from '../../user/service/user.service';
import { GetProfileRes } from '../../user/dto/user/user-profile.dto';

/*
POS  auth/facebook-login { accessToken }                v
POS  auth/google-login   { accessToken }                v
POS  auth/login          { email, password }            v

DEL  auth/logout-all-devices                                        v

POS  auth/refresh-token      { refreshToken }               v
POS  auth/register?code=?    { username, email, password }  v
GET  auth/me                                            v
*/

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private facebookService: FacebookAuthService,
    private googleService: GoogleAuthService,
  ) {}

  @ApiResponse({type: FacebookLoginRes })
  @ApiBody({type: ThirdPartyLoginBody})
  @Post('facebook-login')
  async facebookLogin(
    @Body() body: ThirdPartyLoginBody,
  ): Promise<CoreApiResponse<TokenResponse>> {
    return CoreApiResponse.new(HttpStatus.OK, 'facebook login success', await this.authService.loginWithThirdParty(
      'facebookId', 
      () => 
      this.facebookService.getUser(
        body.accessToken,
        'id',
        'name',
        'email',
        'first_name',
        'last_name',
      ),
    ));
  }

  @ApiBody({ type: ThirdPartyLoginBody })
  @ApiResponse({ type: GoogleLoginRes })
  @Post('google-login')
  async googleLogin(
    @Body() body: ThirdPartyLoginBody,
  ): Promise<CoreApiResponse<TokenResponse>> {
    return CoreApiResponse.new(HttpStatus.OK, 'google login success', 
    await this.authService.loginWithThirdParty(
      'googleId',
      () => this.googleService.getUser(body.accessToken),
    ));
  }

  @ApiResponse({type: LoginRes})
  @ApiBody({type: LoginBody})
  @Post('login')
  async login(@Body() body: LoginBody): Promise<CoreApiResponse<TokenResponse>> {
    return CoreApiResponse.new(HttpStatus.OK, 'login success',
      await this.authService.login(
        await this.authService.validate(body.email, body.password),
      )
    )
  }
  
  @ApiResponse({type: LogoutRes})
  @ApiBearerAuth()
  @JwtAuth()
  @Delete('logout-all-devices')
  async logoutAllDevices(@CurrentUser() user: User): Promise<CoreApiResponse<any>> {

    return CoreApiResponse.new(HttpStatus.OK, 'logout success', 
      await this.authService.logoutAllDevices(user)
    );
  
  }

  @ApiResponse({type: RefreshTokenRes})
  @ApiBody({type: RefreshTokenBody})
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenBody): Promise<CoreApiResponse<TokenResponse>> {
    return CoreApiResponse.new(HttpStatus.OK, 'token refresh success', 
      await this.authService.refreshToken(body.refreshToken)
    )
  }

  @ApiResponse({type: RegisterRes})
  @ApiQuery(OptionalCodeQuery)
  @ApiBody({type: RegisterBody})
  @Post('register')
  async register(
    @Body() body: RegisterBody,
    @Query() query: OptionalCode, 
  ): Promise<CoreApiResponse<TokenResponse>> {
    return CoreApiResponse.new(HttpStatus.OK, 'register success', 
      await this.authService.register(body.username, body.email, body.password, query.code, false)
    );
  }

  @ApiResponse({type: GetProfileRes})
  @ApiBearerAuth()
  @JwtAuth()
  @Get('me')
  async me(@CurrentUser() me: User) {
    return CoreApiResponse.new(HttpStatus.OK, 'profile get success', this.userService.filterUser(me, this.userService.fields('email')))
  }

}

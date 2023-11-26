import {
  HttpException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { Token } from '../guard/jwt-auth.guard';
import { AuthConfig } from '../auth.config';
import { CodeService } from '../../user/service/code.service';
import { ObjectId } from '../../../shared/mongoose/object-id';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface SocialUser {
  id: string;
  name: string;
  email: string;
}

export type GetSocialUserHandler = () => Promise<SocialUser>;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => CodeService)) private codeService: CodeService,
  ) {}

  async register(username: string, email: string, password: string, code?: string, verification = true)
  : Promise<TokenResponse> {

    if (await this.userService.getUserByName(username, '_id', true)) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userService.getUserByEmail(email, '_id', true)) {
      throw new BadRequestException('Email already exists');
    }

    if (verification) {
      if (!code) {
        throw new BadRequestException({
          message: 'Code is required.',
          direction: 'Issue an email code first.'
        })
      }
      await this.codeService.validateCode(code, email);
      await this.codeService.delete(email);
    }

    const user = await this.userService.create({
      username,
      email,
      password,
    });
    return await this.login(user);
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.userService.getUserByEmail(email, '-friends -groups');
    
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (user.isSocial()) {
      throw new UnauthorizedException('User is a social one.')
    }

    if (!(await user.validatePassword(password))) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  async login(user: User): Promise<TokenResponse> {

    const payload: Token = {
      sub: user._id.toString(),
      username: user.username,
    };
    
    return {
      access_token: await this.jwtService.signAsync(
        payload,
        this.getAccessTokenOptions(user),
      ),
      refresh_token: await this.jwtService.signAsync(
        payload,
        this.getRefreshTokenOptions(user),
      ),
    };
  }
  
  async loginWithThirdParty(
    fieldId: keyof User,
    getSocialUser: GetSocialUserHandler,
    customName?: string,
  ): Promise<TokenResponse> {
    try {
      const { id, email } = await getSocialUser();

      const existentUser = await this.userService.getUserBy({ [fieldId]: id }, '-friends -groups');
      if (existentUser) {
        return await this.login(existentUser);
      }
      
      const username = await this.userService.generateUsername(
        customName || email.split('@')[0],
      );
      const newUser = await this.userService.create({
        username,
        [fieldId]: id,
      })
      return await this.login(newUser);

    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {

    try {
      const decoded = this.jwtService.decode(refreshToken) as Token;

      if (!decoded) {
        throw new UnauthorizedException('Unable to decode token')
      }
  
      const user = await this.userService.validateUserById(new ObjectId(decoded.sub), '-friends -groups');
      
      await this.jwtService.verifyAsync<Token>(
        refreshToken,
        this.getRefreshTokenOptions(user),
      );

      await this.userService.resetUserSession(user);
      return await this.login(user);

    } catch(e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logoutAllDevices(user: User): Promise<void> {

    await this.userService.resetUserSession(user);
  
  }

  getRefreshTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('refresh', user);
  }

  getAccessTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('access', user);
  }

  private getTokenOptions(type: 'refresh' | 'access', user: User): JwtSignOptions {
    const options: JwtSignOptions = {
      //@ts-ignore
      secret: AuthConfig[type + 'TokenSecret'] + user.sessionToken,
    };

    //@ts-ignore
    const expiration = AuthConfig[type + 'TokenExpiration'];

    if (expiration) {
      options.expiresIn = expiration;
    }

    return options;
  }


}

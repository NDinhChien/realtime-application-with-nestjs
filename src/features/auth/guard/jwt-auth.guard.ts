import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Client, getClient } from '../../../shared/utils/get-client';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../service/auth.service';
import { User } from '../../user/schema/user.schema';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { Document } from 'mongoose';
import { getSocketUser } from '../../../shared/utils/get-socket-user';
import { getSocketClient } from '../../../shared/utils/get-socket-client';

export interface Token {
  sub: string;
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  reflector: Reflector;

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {
    this.reflector = new Reflector();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = this.getRequest(ctx);
    try {
      client.user = await this.handleRequest(ctx, client) as User;
    } catch (e) {
      throw e;
    }

    return client.user != null;
  }

  private async handleRequest(ctx: ExecutionContext, client: Client): Promise<User|ErrorMessage> {
    const token = this.getToken(ctx, client);
    if (typeof token !== 'string') return token;

    const decoded = this.jwtService.decode(token) as Token;

    if (!decoded) {
      return this.throwException(ctx, 'Unable to decode token');
    }
    try {

      const user = await this.validate(decoded);

      await this.jwtService.verifyAsync<Token>(
        token,
        this.authService.getAccessTokenOptions(user),
      );

      return user;
    } catch (e: any) {
      if (e.name === 'TokenExpiredError') {
        return this.throwException(ctx, 'Expired token')
      }
      return this.throwException(ctx, 'Invalid token');
    }
  }

  private async validate({ sub }: Token): Promise<User> {
    return await this.userService.validateUserById(new ObjectId(sub), '-friends');
  }

  private getRequest(ctx: ExecutionContext): Client {
    return getClient(ctx) as Client;
  }

  private getToken(ctx: ExecutionContext, client: Client): string|ErrorMessage {
    const authorization = client.headers.authorization?.split(' ');

    if (!authorization) {
      return this.throwException(ctx, 'Token not found');
    }

    if (authorization[0].toLowerCase() !== 'bearer') {
      return this.throwException(ctx, 'Authorization type not valid');
    }

    if (!authorization[1]) {
      return this.throwException(ctx, 'Token not provided');
    }

    return authorization[1];
  }

  throwException(ctx: ExecutionContext, message: string): ErrorMessage {
    if (!ctx) return { message };
    
    if (ctx.getType() === 'ws') {
      this.disconnect( 
        ctx.switchToWs().getClient<Socket>(), 
        message
      );
    }

    throw new UnauthorizedException(message);
  }

  async disconnect(socket: Socket, message: string) {
    socket.emit('exception', message);
    setTimeout(()=>{
      socket.disconnect(true)
    }, 2000)
  }

  public async handleSocketConnection(socket: Socket) {
    const client = getSocketClient(socket);
    const result = await this.handleRequest(null as any, client);
    if (result instanceof Document) {
      client.user = result;
    }
    else {
      this.disconnect(socket, result.message);
    }
  }
}

type ErrorMessage = {message: string}
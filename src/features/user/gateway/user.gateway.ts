import { forwardRef, Inject, Logger, UseFilters, UsePipes } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { hostname } from 'os';
import { Server, Socket } from 'socket.io';
import { getSocketUser } from '../../../shared/utils/get-socket-user';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { ExceptionsFilter } from '../../../shared/core/filter/exceptions.filter';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@UseFilters(ExceptionsFilter)
@JwtAuth()
@WebSocketGateway()
export class UserGateway implements OnGatewayDisconnect, OnGatewayConnection {


  @WebSocketServer()
  server: Server;

  logger = new Logger(this.constructor.name);

  online = 0;

  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private jwtGuard: JwtAuthGuard,
    
  ) {}

  async handleConnection(socket: Socket) {

    await this.jwtGuard.handleSocketConnection(socket);
    const user = getSocketUser(socket);
    if (!user) return;
    await this.subscribe(socket, user);

  }

  async handleDisconnect(socket: Socket) {

    const user = getSocketUser(socket);
    if (!user) return;
    await this.unsubscribe(socket, user);

  }
  
  @SubscribeMessage('logout')
  async unsubscribe(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: User,
  ) {
    const minusOnlineUser = await this.userService.unsubscribeUser(client);
    
    if (minusOnlineUser === 0) return;
    this.online--;
    this.logger.log(
      `User ${user.username} left the server ${hostname()}; ${this.online}`,
    );

  }

  async subscribe(
    client: Socket,
    user: User,
  ) {
    const addOnlineUser = await this.userService.subscribeUser(client, user);

    if (addOnlineUser === 0) return;
    this.online++;
    this.logger.log(
      `User ${user.username} joined the server ${hostname()}; ${this.online}`,
    );
  }

}

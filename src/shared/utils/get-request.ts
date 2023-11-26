import { ArgumentsHost, ExecutionContext } from '@nestjs/common';

export const getRequest = <T>(ctx: ExecutionContext | ArgumentsHost): T|undefined => {
  switch (ctx.getType()) {
    case 'ws':
      return ctx.switchToWs().getClient<T>();  // Socket.handshake
    case 'http':
      return ctx.switchToHttp().getRequest<T>(); // Request
    default:
      return undefined;
  }
};

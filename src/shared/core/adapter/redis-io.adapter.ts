import { INestApplicationContext } from '@nestjs/common';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';
import { CustomSocketIoAdapter } from './custom-socket-io.adapter';

export class RedisIoAdapter extends CustomSocketIoAdapter {
  private redisAdapter: RedisAdapter;

  constructor(host: string, port: number, app: INestApplicationContext) {
    super(app);

    const pubClient = createClient({ 
      url:  `redis://${host}:${port}`,
    });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      this.redisAdapter = createAdapter(pubClient, subClient)(undefined);
    })
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    server.adapter(this.redisAdapter as any);

    return server;
  }
}

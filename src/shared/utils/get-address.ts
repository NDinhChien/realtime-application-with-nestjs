import { Dictionary } from 'code-config/dist';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { Client } from './get-client';
import { AppConfig } from '../../app.config';

const getAddressFrom = (ip: string, headers: Client['headers']) => {
  const isProxy = AppConfig.proxyEnabled;
  return (
    (!isProxy && ip) || headers['x-forwarded-for'] || headers['x-real-ip'] || ip
  );
};

export const getAddress = (client: Socket | Request): string => {
  if (client instanceof Socket) {
    return getAddressFrom(
      client.handshake.address,
      client.handshake.headers as Dictionary,
    );
  }

  return getAddressFrom(client.ip as string, client.headers as Dictionary);
};

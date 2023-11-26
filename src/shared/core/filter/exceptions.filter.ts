import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { getRequest } from '../../utils/get-request';
import { Request } from 'express';
import { Error as MongoError } from 'mongoose';
import { CoreApiResponse } from '../CoreApiResponse';
import { Injectable } from '@nestjs/common'

@Injectable()
@Catch(Error)
export class ExceptionsFilter implements ExceptionFilter {
  
  catch(exception: Error, host: ArgumentsHost) {
    const request = getRequest<Socket | Request>(host);
    let status = 500;
    const message = exception.message || 'Internal server error';
    let response = CoreApiResponse.new(status, message, null);

    if (exception instanceof MongoError) {
      response = CoreApiResponse.new(status, message, null);
    }
    
    else if (this.isHttpException(exception)) {
      status = exception.getStatus();
      const error: any = exception.getResponse();
      response = this.getCoreResponse(status, message, error);
    }
    
    else if (this.isWsException(exception)) { 
      const error: any = exception.getError();
      response = this.getCoreResponse(status, message, error);
    }

    switch (host.getType()) {
      case 'http':
        host
          .switchToHttp()
          .getResponse()
          .status(status)
          .json(response);
        break;

      case 'ws':
        const callback = host.getArgByIndex(2);

        if (typeof callback === 'function') {
          callback(response);
        }
        request?.emit('exception', response);
        break;

      default:
        break;
    }

    return response;
  }

  isHttpException(err: Error): err is HttpException {
    return err instanceof HttpException;
  }
  isWsException(err: Error): err is WsException {
    return err instanceof WsException
  }
  getCoreResponse(status: number, msg: string, err: any) {
    let data = null;
    if (typeof err === 'string') {
      msg = err;
    } else {
      const { message, statusCode, error, ... left} = err;
      if (message) {
        msg = message;
      }
      if (Object.keys(left).length > 0) {
        data = left;
      }
    }
    return CoreApiResponse.new(status, msg, data);
  }
}

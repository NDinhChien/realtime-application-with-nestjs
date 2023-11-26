import { ValidationPipe, BadRequestException } from '@nestjs/common';

export function getValidationPipe() {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      const messages = Object.values((errors[0].constraints) as any );
      throw new BadRequestException({
        message: 'bad request',
        details: messages,
      })
    }
  })
}
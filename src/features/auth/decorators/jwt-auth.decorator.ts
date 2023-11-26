import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

export const JwtAuth = () => {
  return UseGuards(JwtAuthGuard);
};
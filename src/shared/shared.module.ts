import { Module, Global, } from '@nestjs/common';
import { HandleBarService } from './handlebar/handlebar.service';
import { ExceptionsFilter } from './core/filter/exceptions.filter';

@Global()
@Module({
  providers: [HandleBarService, ExceptionsFilter,],
  exports: [HandleBarService, ExceptionsFilter,],
})
export class SharedModule {}
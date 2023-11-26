import { FeaturesModule } from './features/features.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionsFilter } from './shared/core/filter/exceptions.filter';
import { getValidationPipe } from './shared/pipe/validation-pipe';
import { SharedModule } from './shared/shared.module';
import { AppConfig } from './app.config';

@Module({
  imports: [
    SharedModule,
    FeaturesModule,
    MongooseModule.forRoot(AppConfig.mongoUri, {
      autoIndex: false,
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: getValidationPipe(),
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}

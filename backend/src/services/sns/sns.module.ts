import { Module } from '@nestjs/common';
import { SNSService } from './sns.service';

@Module({
  providers: [SNSService],
  exports: [SNSService],
})
export class SNSModule {}

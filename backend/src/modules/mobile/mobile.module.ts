import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MongoModule, SNSModule } from '../../services'

@Module({
  imports: [MongoModule, SNSModule],
  controllers: [MobileController],
})
export class MobileModule {}

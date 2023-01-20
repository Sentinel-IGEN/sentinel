import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MongoModule, MqttModule, SNSModule } from '../../services'

@Module({
  imports: [MongoModule, SNSModule, MqttModule],
  controllers: [MobileController],
})
export class MobileModule {}

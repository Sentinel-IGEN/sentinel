import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { MongoModule, MqttModule } from '../../services'

@Module({
  imports: [MongoModule, MqttModule],
  controllers: [DeviceController],
})
export class DeviceModule {}

import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { MongoModule, MqttModule } from '../../services'
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [MongoModule, MqttModule, WebSocketModule],
  controllers: [DeviceController],
})
export class DeviceModule {}

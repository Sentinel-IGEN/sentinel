import { Module } from '@nestjs/common';
import { WebSocketModule } from 'src/modules/websocket/websocket.module';
import { MqttService } from './mqtt.service';

@Module({
  imports: [WebSocketModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}

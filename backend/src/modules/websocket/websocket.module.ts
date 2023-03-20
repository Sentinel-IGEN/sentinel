import { Module } from '@nestjs/common';
import { WebSocketListener } from './websocket.gateway';
import { MongoModule } from '../../services';

@Module({
  imports: [MongoModule],
  providers: [WebSocketListener],
  exports: [WebSocketListener],
})
export class WebSocketModule {}

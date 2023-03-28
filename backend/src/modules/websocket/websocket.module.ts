import { Module } from '@nestjs/common';
import { FetchModule } from 'nestjs-fetch';
import { WebSocketListener } from './websocket.gateway';
import { MongoModule } from '../../services';

@Module({
  imports: [MongoModule, FetchModule],
  providers: [WebSocketListener],
  exports: [WebSocketListener],
})
export class WebSocketModule {}

import { Module } from '@nestjs/common';
import { FetchModule } from 'nestjs-fetch';
import { WebSocketListener } from './websocket.gateway';
import { MongoModule, SNSModule } from '../../services';

@Module({
  imports: [MongoModule, SNSModule, FetchModule],
  providers: [WebSocketListener],
  exports: [WebSocketListener],
})
export class WebSocketModule {}

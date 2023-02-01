import { Module } from '@nestjs/common';
import { WebSocketListener } from './websocket.gateway';

@Module({
    providers: [WebSocketListener],
    exports: [WebSocketListener],
})
export class WebSocketModule {}
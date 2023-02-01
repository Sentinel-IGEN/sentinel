import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// DI imports
import { DeviceModule } from './modules/device/device.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DeviceModule,
    MobileModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

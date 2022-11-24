import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { MongoModule } from '../../services'

@Module({
  imports: [MongoModule],
  controllers: [DeviceController],
})
export class DeviceModule {}

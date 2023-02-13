import { Controller, Body, Post, HttpException } from '@nestjs/common';
import { Error } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MongoService, MqttService } from '../../services';
import { CreateDeviceDTO } from 'src/schemas/dtos';
import { EmbeddedDevice } from 'src/schemas/EmbeddedDevice.schema';

@Controller('/device')
export class DeviceController {
  constructor(
    private readonly MongoService: MongoService,
    private readonly MqttService: MqttService,
  ) {}

  // Create embedded device using device UUID
  // TODO: Require server key to call this endpoint
  @Post('')
  async registerDevice(
    @Body() createDeviceDTO: CreateDeviceDTO,
  ): Promise<EmbeddedDevice | unknown> {
    try {
      const data = await this.MongoService.createEmbeddedDevice(
        createDeviceDTO,
      );
      return data;
    } catch (err) {
      if (err instanceof Error.ValidationError) {
        throw new HttpException(err.message, 400);
      }
      return err;
    }
  }
}

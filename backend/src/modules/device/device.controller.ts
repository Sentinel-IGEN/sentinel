import { Controller, Body, Post, HttpException } from '@nestjs/common';
import { Error } from 'mongoose';
import { MongoService } from '../../services';
import { CreateDeviceDTO } from 'src/schemas/dtos';
import { EmbeddedDevice } from 'src/schemas/EmbeddedDevice.schema';

@Controller('/device')
export class DeviceController {
  constructor(
    private readonly MongoService: MongoService,
  ) {}

  // Create embedded device using device UUID
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

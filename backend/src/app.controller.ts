import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SNSService, MongoService } from './services';
import { EmbeddedDevice } from './schemas/EmbeddedDevice.schema';
import { CreateDeviceDTO } from './schemas/dtos';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly SNSService: SNSService,
    private readonly MongoService: MongoService,
  ) {}

  @Get(['/health', ''])
  health(): string {
    return this.appService.getHealth();
  }

  // PLACEHOLDER FOR TESTING
  @Post('/test/topic/:topicId')
  async createTopic(@Param() params): Promise<string> {
    try {
      const TopicARN = await this.SNSService.createTopic(params.topicId);
      return TopicARN;
    } catch (err) {
      return err;
    }
  }

  // Register embedded device using device UUID
  @Post('/device')
  async registerDevice(
    @Body() createDeviceDTO: CreateDeviceDTO,
  ): Promise<EmbeddedDevice> {
    try {
      return this.MongoService.createEmbeddedDevice(createDeviceDTO);
    } catch (err) {
      return err;
    }
  }
}

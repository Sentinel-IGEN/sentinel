import { Controller, Get, Param, Body, Post, HttpException } from '@nestjs/common';
import { Error } from 'mongoose'
import { AppService } from './app.service';
import { SNSService, MongoService } from './services';
import { EmbeddedDevice } from './schemas/EmbeddedDevice.schema';
import { User } from './schemas/User.schema';
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
  async createTopic(@Param() params): Promise<string | undefined | unknown> {
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
  ): Promise<EmbeddedDevice | unknown> {
    try {
      const data = await this.MongoService.createEmbeddedDevice(createDeviceDTO);
      return data
    } catch (err) {
      if(err instanceof Error.ValidationError) {
        throw new HttpException(err.message, 400)
      }
      return err;
    }
  }

  // Create user
  @Post('/user')
  async createUser(@Body() user: User): Promise<User | unknown> {
    try {
      const data = await this.MongoService.createUser(user);
      return data
    } catch (err) {
      return err;
    }
  }

  // Register Mobile Device
  @Post('/mobile/register')
  async registerMobileUser(@Body() user: User): Promise<User | unknown> {
    try {
      const data = await this.MongoService.createUser(user);
      return data
    } catch (err) {
      return err;
    }
  }
}

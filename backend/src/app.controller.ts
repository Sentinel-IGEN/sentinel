import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SNSService } from './services/sns.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly SNSService: SNSService,
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
}

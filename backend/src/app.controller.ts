import { Controller, Get } from '@nestjs/common';
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
}

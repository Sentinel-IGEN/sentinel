import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'App is running.';
  }
}

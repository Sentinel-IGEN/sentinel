import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SNSClient } from '@aws-sdk/client-sns';
import { Credentials } from '@aws-sdk/types';

@Injectable()
export class SNSService implements OnApplicationBootstrap {
  private sns = new SNSClient({});

  onApplicationBootstrap() {
    console.log('Initializing AWS SDK');
  }
}

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SNSClient } from '@aws-sdk/client-sns';
import { Credentials } from '@aws-sdk/types';

@Injectable()
export class SNSService implements OnApplicationBootstrap {
  private sns = new SNSClient({
    region: 'us-west-2',
  });

  onApplicationBootstrap() {
    console.log('Initializing AWS SDK');
  }
}

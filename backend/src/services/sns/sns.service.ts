import { Injectable } from '@nestjs/common';
import {
  SNSClient,
  CreateTopicCommand,
  CreatePlatformEndpointCommand,
} from '@aws-sdk/client-sns';

@Injectable()
export class SNSService {
  private sns = new SNSClient({});

  // Create Topic
  // Params: topicName, should be unique
  // Returns AWS ARN of topic
  // Not currently used in production
  async createTopic(topicName: string): Promise<string | undefined> {
    const command = new CreateTopicCommand({
      Name: topicName,
    });

    const response = await this.sns.send(command);
    return response.TopicArn;
  }

  // Create platform endpoint
  // Params: platformApplicationArn, mobile device token
  // Returns AWS ARN of endpoint
  async createEndpoint(
    platformApplicationArn: string,
    deviceToken,
  ): Promise<string | undefined> {
    const command = new CreatePlatformEndpointCommand({
      PlatformApplicationArn: platformApplicationArn,
      Token: deviceToken,
    });

    const response = await this.sns.send(command);
    return response.EndpointArn;
  }

  getPlatformApplicationARNByOS(os: 'iOS' | 'Android') {
    if (os === 'iOS') {
      return process.env.AWS_SNS_IOS_PUSH_ARN;
    } else if (os === 'Android') {
      return process.env.AWS_SNS_ANDROID_PUSH_ARN;
    }
  }
}

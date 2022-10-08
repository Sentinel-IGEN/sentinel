import { Injectable } from '@nestjs/common';
import { SNSClient, CreateTopicCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SNSService {
  private sns = new SNSClient({});

  // Create Topic
  // Params: topicName, should be unique
  // Returns AWS ARN of topic
  async createTopic(topicName: string): Promise<string> {
    const command = new CreateTopicCommand({
      Name: topicName,
    });

    const response = await this.sns.send(command);
    return response.TopicArn;
  }
}

import { Injectable } from '@nestjs/common';
import {
  SNSClient,
  CreateTopicCommand,
  CreatePlatformEndpointCommand,
  GetEndpointAttributesCommand,
  SetEndpointAttributesCommand,
  CreateSMSSandboxPhoneNumberCommand,
  VerifySMSSandboxPhoneNumberCommand,
  VerifySMSSandboxPhoneNumberCommandInput,
  PublishCommand,
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

  /*
  Attributes include the following:

    CustomUserData – arbitrary user data to associate with the endpoint. Amazon SNS does not use this data. The data must be in UTF-8 format and less than 2KB.

    Enabled – flag that enables/disables delivery to the endpoint. Amazon SNS will set this to false when a notification service indicates to Amazon SNS that the endpoint is invalid. Users can set it back to true, typically after updating Token.

    Token – device token, also referred to as a registration id, for an app and mobile device. This is returned from the notification service when an app and mobile device are registered with the notification service.

    The device token for the iOS platform is returned in lowercase.
  */
  async getPlatformEndpointAttributes(endpointARN: string | undefined) {
    const command = new GetEndpointAttributesCommand({
      EndpointArn: endpointARN,
    });

    const response = await this.sns.send(command);
    return response.Attributes;
  }

  // set platform endpoint attributes
  // returns metadata
  async setPlatformEndpointAttributes(
    endpointARN: string | undefined,
    attributes: Record<string, string>,
  ) {
    const command = new SetEndpointAttributesCommand({
      EndpointArn: endpointARN,
      Attributes: attributes,
    });

    const response = await this.sns.send(command);
    return response;
  }

  getPlatformApplicationARNByOS(os: 'iOS' | 'Android') {
    if (os === 'iOS') {
      return process.env.AWS_SNS_IOS_PUSH_ARN;
    } else if (os === 'Android') {
      return process.env.AWS_SNS_ANDROID_PUSH_ARN;
    }
  }

  // create phone number in SMS Sandbox
  async createPhoneNumber(phoneNumber: string) {
    const command = new CreateSMSSandboxPhoneNumberCommand({
      PhoneNumber: phoneNumber,
    });

    const response = await this.sns.send(command);
    return response;
  }

  // verify phone number in SMS Sandbox
  async verifyPhoneNumber(data: VerifySMSSandboxPhoneNumberCommandInput) {
    const command = new VerifySMSSandboxPhoneNumberCommand(data);

    const response = await this.sns.send(command);
    return response;
  }

  async sendSMS(message: string, phoneNumber: string) {
    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message
    });

    const response = await this.sns.send(command);
    return response;
  }
}

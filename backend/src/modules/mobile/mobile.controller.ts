import { Controller, Param, Body, Post, HttpException } from '@nestjs/common';
import { SNSService, MongoService } from '../../services';
import { User } from '../../schemas/User.schema';
import { RegisterMobileDeviceTokenDTO } from '../../schemas/dtos';
import { NotFoundException } from '@aws-sdk/client-sns';
@Controller('/mobile')
export class MobileController {
  constructor(
    private readonly SNSService: SNSService,
    private readonly MongoService: MongoService,
  ) {}

  // Create mobile user
  @Post('')
  async createUser(@Body() user: User): Promise<User | unknown> {
    const data = await this.MongoService.createUser(user);
    return data;
  }

  // Register Mobile Device Token: should be able to be called multiple times without failure
  // See https://docs.aws.amazon.com/sns/latest/dg/mobile-platform-endpoint.html#mobile-platform-endpoint-pseudo-code for breakdown
  @Post('/registerDeviceToken')
  async registerMobileUser(@Body() data: RegisterMobileDeviceTokenDTO) {
    if (data.deviceToken && data.type && data.userId) {
      // get platformApplicationARN from supplied os type
      const platformApplicationARN =
        this.SNSService.getPlatformApplicationARNByOS(data.type);

      if (platformApplicationARN === undefined) {
        throw new HttpException(
          'Supplied OS type cannot be mapped to a Platform Application',
          400,
        );
      }

      // Get user by id and check if platform endpoint ARN is stored yet
      const user = await this.MongoService.getUser(data.userId);

      if (user === null) {
        throw new HttpException(
          'Could not find user with supplied userId',
          404,
        );
      }

      // If endpoint ARN is not stored, create platform endpoint for user and store it
      let newEndpointARN: string | undefined;
      if (user.endpointARN === undefined) {
        console.log('ENDPOINT ARN was not previously stored for the user');

        newEndpointARN = await this.SNSService.createEndpoint(
          platformApplicationARN,
          data.deviceToken,
        );
        console.log('created platform endpoint using AWS SNS');

        await this.MongoService.updateUser(data.userId, {
          endpointARN: newEndpointARN,
        });
        console.log('updated user in mongoDB with new endpoint arn');
      }

      try {
        const attributes = await this.SNSService.getPlatformEndpointAttributes(
          user.endpointARN || newEndpointARN,
        );
        console.log(`got endpoint attributes: ${attributes}`);

        if (
          attributes?.Token !== data.deviceToken ||
          attributes?.Enabled === 'false'
        ) {
          console.log(
            "either stored token doesn't match supplied token, or endpoint is disabled",
          );
          // set endpoint attributes here
          const metaData = await this.SNSService.setPlatformEndpointAttributes(
            user.endpointARN || newEndpointARN,
            {
              Token: data.deviceToken,
              Enabled: 'true',
            },
          );
          console.log(
            `set platform attributes with new token and Enabled: true, here is the return: ${metaData}`,
          );
        }
      } catch (err) {
        console.log(`caught err when getting endpoint attributes: ${err}`);
        if (err instanceof NotFoundException) {
          newEndpointARN = await this.SNSService.createEndpoint(
            platformApplicationARN,
            data.deviceToken,
          );
          console.log(
            `caught non found error, meaning endpoint was deleted. created new endpoint with ARN: ${newEndpointARN}`,
          );

          await this.MongoService.updateUser(data.userId, {
            endpointARN: newEndpointARN,
          });
          console.log('updated user in mongoDB with new endpointARN');
        }
      }
    } else {
      throw new HttpException('JSON body is missing required fields', 400);
    }
  }
}

import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpCode,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SNSService, MongoService, MqttService } from '../../services';
import { User } from '../../schemas/User.schema';
import {
  RegisterMobileDeviceTokenDTO,
  RegisterPhoneNumberDTO,
  VerifyPhoneNumberDTO,
  SendSMSDTO,
  SendMQTTMessageDTO,
  LockDeviceDTO,
  MotionThresholdDTO,
  alarmDTO,
} from '../../schemas/dtos';
import { NotFoundException } from '@aws-sdk/client-sns';
@Controller('/mobile')
export class MobileController {
  constructor(
    private readonly SNSService: SNSService,
    private readonly MongoService: MongoService,
    private readonly MqttService: MqttService,
  ) {}

  // Create mobile user
  @Post('')
  async createUser(@Body() user: User): Promise<User | unknown> {
    Logger.log('Creating user');
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
        Logger.debug('ENDPOINT ARN was not previously stored for the user');

        newEndpointARN = await this.SNSService.createEndpoint(
          platformApplicationARN,
          data.deviceToken,
        );
        Logger.debug('created platform endpoint using AWS SNS');

        await this.MongoService.updateUser(data.userId, {
          endpointARN: newEndpointARN,
        });
        Logger.debug('updated user in mongoDB with new endpoint arn');
      }

      try {
        const attributes = await this.SNSService.getPlatformEndpointAttributes(
          user.endpointARN || newEndpointARN,
        );
        Logger.debug(`got endpoint attributes: ${attributes}`);

        if (
          attributes?.Token !== data.deviceToken ||
          attributes?.Enabled === 'false'
        ) {
          Logger.debug(
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
          Logger.debug(
            `set platform attributes with new token and Enabled: true, here is the return: ${metaData}`,
          );
        }
      } catch (err) {
        Logger.debug(`caught err when getting endpoint attributes: ${err}`);
        if (err instanceof NotFoundException) {
          newEndpointARN = await this.SNSService.createEndpoint(
            platformApplicationARN,
            data.deviceToken,
          );
          Logger.debug(
            `caught non found error, meaning endpoint was deleted. created new endpoint with ARN: ${newEndpointARN}`,
          );

          await this.MongoService.updateUser(data.userId, {
            endpointARN: newEndpointARN,
          });
          Logger.debug('updated user in mongoDB with new endpointARN');
        }
      }
    } else {
      throw new HttpException('JSON body is missing required fields', 400);
    }
  }

  @Post('/registerPhoneNumber')
  async registerPhoneNumber(@Body() data: RegisterPhoneNumberDTO) {
    const res = await this.SNSService.createPhoneNumber(data.phoneNumber);
    return res;
  }

  @Post('/verifyPhoneNumber')
  async verifyPhoneNumber(@Body() data: VerifyPhoneNumberDTO) {
    await this.SNSService.verifyPhoneNumber({
      PhoneNumber: data.phoneNumber,
      OneTimePassword: data.oneTimePassword,
    });

    const user = await this.MongoService.updateUser(data.userId, {
      phoneNumber: data.phoneNumber,
    });

    return user;
  }

  @Post('/toggleLock')
  @HttpCode(201)
  toggleLock(@Body() data: LockDeviceDTO) {
    const message = {
      command: Number(data.status), // 0: unlock, 1: lock
    };
    const result = this.MqttService.publishMessage(
      'lock',
      data.device,
      JSON.stringify(message),
    );
    return result ? 'success' : 'failure';
  }

  @Post('/setMotionThreshold')
  @HttpCode(201)
  setMotionThreshold(@Body() data: MotionThresholdDTO) {
    const message = {
      command: Number(data.threshold), // 1 - 10
    };
    const result = this.MqttService.publishMessage(
      'motion_threshold',
      data.device,
      JSON.stringify(message),
    );
    return result ? 'success' : 'failure';
  }

  @Post('/toggleAlarm')
  @HttpCode(201)
  toggleAlarm(@Body() data: alarmDTO) {
    const message = {
      command: Number(data.status), // 0:off, 1:on
    };
    const result = this.MqttService.publishMessage(
      'alarm',
      data.device,
      JSON.stringify(message),
    );
    return result ? 'success' : 'failure';
  }

  @Get('/logs/:deviceId')
  async getGPSLogs(@Param('deviceId') deviceId) {
    Logger.debug(`getGPSLogs called with deviceId: ${deviceId}`);
    const embeddedDevice = await this.MongoService.getEmbeddedDevice(deviceId);

    return embeddedDevice?.gpsLog;
  }

  /* FOR TESTING */
  @Post('/sendMQTTMessage')
  @HttpCode(201)
  sendMQTTMessage(@Body() data: SendMQTTMessageDTO) {
    const result = this.MqttService.publishMessage(
      data.topic,
      data.device,
      data.message,
    );
    return result ? 'success' : 'failure';
  }

  /* ENDPOINT FOR TESTING */
  /* NOT FOR USE */
  @Post('/sendSMS')
  async sendSMS(@Body() data: SendSMSDTO) {
    await this.SNSService.sendSMS(data.message, data.phoneNumber);
    return 'Success';
  }
}

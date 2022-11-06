import { Controller, Param, Body, Post } from '@nestjs/common';
import { SNSService, MongoService } from '../../services';
import { User } from '../../schemas/User.schema';
import { RegisterMobileDeviceTokenDTO } from '../../schemas/dtos'

@Controller('/mobile')
export class MobileController {
  constructor(
    private readonly SNSService: SNSService,
    private readonly MongoService: MongoService,
  ) {}

  // Create mobile user
  @Post('')
  async createUser(@Body() user: User): Promise<User | unknown> {
    try {
      const data = await this.MongoService.createUser(user);
      return data
    } catch (err) {
      return err;
    }
  }

  // Register Mobile Device Token: should be able to be called multiple times without failure
  @Post('/registerDeviceToken')
  async registerMobileUser(@Body() data: RegisterMobileDeviceTokenDTO) {
    try {

    } catch (err) {
    }
  }

}

import { Controller, Param, Body, Post, HttpException } from '@nestjs/common';
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
      if(data.deviceToken && data.type && data.userId) {
        // get platformApplicationARN from supplied os type
        const platformApplicationARN = this.SNSService.getPlatformApplicationARNByOS(data.type)

        if(platformApplicationARN === undefined) {
          throw new HttpException("Supplied OS type cannot be mapped to a Platform Application", 400)
        }

        // Get user by id and check if platform endpoint ARN is stored yet
        const user = await this.MongoService.getUser(data.userId)

        if(user === null) {
          throw new HttpException("Could not find user with supplied userId", 404)
        }

        // If endpoint ARN is not stored, create platform endpoint for user and store it
        if(user.endpointARN === undefined) {
          const newEndpointARN = await this.SNSService.createEndpoint(platformApplicationARN, data.deviceToken)
          await this.MongoService.updateUser(data.userId, {endpointARN: newEndpointARN})
        }

        /**
         * TODO: finish rest of attribute checks
         * 
         * 
         * Pseudocode:
         call get endpoint attributes on the platform endpoint ARN 

          if (while getting the attributes a not-found exception is thrown)
            # the platform endpoint was deleted 
            call create platform endpoint with the latest device token
            store the returned platform endpoint ARN
          else 
            if (the device token in the endpoint does not match the latest one) or 
                (get endpoint attributes shows the endpoint as disabled)
              call set endpoint attributes to set the latest device token and then enable the platform endpoint
            endif
          endif
         */

      } else {
        throw new HttpException("JSON body is missing required fields", 400)
      }
    } catch (err) {
      return err;
    }
  }

}

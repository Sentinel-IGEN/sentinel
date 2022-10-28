import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserMongooseSchema, User } from '../schemas/User.schema';
import { EmbeddedDeviceMongooseSchema, EmbeddedDevice } from '../schemas/EmbeddedDevice.schema';
import { CreateDeviceDTO, UpdateDeviceDTO } from 'src/schemas/dtos';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MongoService implements OnApplicationBootstrap {
  private User = mongoose.model('User', UserMongooseSchema);
  private EmbeddedDevice = mongoose.model(
    'EmbeddedDevice',
    EmbeddedDeviceMongooseSchema,
  );

  onApplicationBootstrap() {
    // Connect to MongoDB on application bootstrap
    mongoose.connect(process.env.DB_URL, {
      autoIndex: true,
    });
    mongoose.connection.once('open', () => {
      console.log('MongoDB connection established');
    });
  }

  // Create device method, automatically hashes token before storing in DB
  async createEmbeddedDevice(deviceData: CreateDeviceDTO) {
    const { token, ...device } = deviceData;

    // Generate salted hash for deviceTokenHash here
    const tokenHash = await bcrypt.hash(token, 10);

    const newDevice = new this.EmbeddedDevice({
      tokenHash,
      ...device,
    });
    const data = await newDevice.save();

    return data;
  }

  async updateEmbeddedDevice(deviceData: UpdateDeviceDTO) {
    const { token, ...device } = deviceData;
    let tokenHash: string | undefined;

    // Generate salted hash for deviceTokenHash here if token is supplied
    if (token) {
      tokenHash = await bcrypt.hash(token, 10);
    }

    // Define the filter using the uuid supplied
    const filter = { uuid: device.uuid };

    let data: EmbeddedDevice | null;
    // If tokenHash exists, update device data with it.
    if (tokenHash) {
      data = await this.EmbeddedDevice.findOneAndUpdate(
        filter,
        {
          tokenHash,
          ...device,
        },
        {
          // new flag so the updated device is returned instead of old
          new: true,
        },
      );
    // If tokenHash doesnt exist, update device using the rest of the data not including tokenHash
    } else {
      data = await this.EmbeddedDevice.findOneAndUpdate(filter, device, {
        new: true,
      });
    }

    return data;
  }

  // Get device by uuid
  async getEmbeddedDevice(uuid: string) {
    const data: EmbeddedDevice | null = await this.EmbeddedDevice.findOne({ uuid });
    return data;
  }

  // Authenticate device token
  // returns true if device token is correct and false otherwise
  async authEmbeddedDevice(deviceData: CreateDeviceDTO) {
    let match = false;

    const device = await this.EmbeddedDevice.findOne({ uuid: deviceData.uuid });
    if (device) {
      match = await bcrypt.compare(deviceData.token, device.tokenHash);
    }

    return match;
  }

  async createUser(userData: User) {
    const newUser = new this.User(userData);
    const data: User = await newUser.save();

    return data;
  }
}

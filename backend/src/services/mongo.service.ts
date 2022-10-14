import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserMongooseSchema } from '../schemas/User.schema';
import { EmbeddedDeviceMongooseSchema } from '../schemas/EmbeddedDevice.schema';
import { CreateDeviceDTO } from 'src/schemas/dtos';
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
    // Generate salted hash for deviceTokenHash here
    const tokenHash = await bcrypt.hash(deviceData.token, 10);

    const newDevice = new this.EmbeddedDevice({
      tokenHash,
      ...deviceData,
    });
    const data = await newDevice.save();

    return data;
  }

  // Get device by uuid
  async getEmbeddedDevice(uuid: string) {
    const data = await this.EmbeddedDevice.findOne({ uuid });
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
}

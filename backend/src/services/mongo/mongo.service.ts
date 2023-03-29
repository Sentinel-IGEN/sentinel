import {
  Injectable,
  OnApplicationBootstrap,
  HttpException,
  Logger,
} from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { UserMongooseSchema, User } from '../../schemas/User.schema';
import {
  EmbeddedDeviceMongooseSchema,
  EmbeddedDevice,
} from '../../schemas/EmbeddedDevice.schema';
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
      Logger.debug('MongoDB connection established');
    });
  }

  /******  EMBEDDED DEVICE CRUD OPERATIONS ******/

  // Create device method, automatically hashes token before storing in DB
  async createEmbeddedDevice(
    deviceData: CreateDeviceDTO,
  ): Promise<EmbeddedDevice> {
    const { token, ...device } = deviceData;

    if (token === undefined) {
      throw new HttpException('Device token field is required', 400);
    }

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
    // Logger.debug('updateEmbeddedDevice called with payload: ', deviceData);
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
    const data: EmbeddedDevice | null = await this.EmbeddedDevice.findOne({
      uuid,
    });
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

  /******  USER CRUD OPERATIONS  ******/

  async createUser(userData: User) {
    // Embedded device must exist to create user
    const device: EmbeddedDevice | null = await this.EmbeddedDevice.findOne({
      uuid: userData.embeddedDeviceId,
    });

    if (device === null) {
      throw new HttpException(
        'Could not find device with supplied embeddedDeviceId',
        404,
      );
    }

    // create new user
    const newUser = new this.User(userData);
    const data = await newUser.save();

    // update device with the created userId
    const updatedDevice = await this.updateEmbeddedDevice({
      uuid: device.uuid,
      userId: data._id,
    });

    // if new user's id does not match the updated device's userId, then return error
    if (data._id.toString() === updatedDevice?.userId?.toString()) {
      return data;
    } else {
      throw new HttpException(
        'User created, but embedded device document not updated to link the userId field',
        500,
      );
    }
  }

  // Get user by uuid
  async getUser(userId: Types.ObjectId) {
    const data: User | null = await this.User.findById(userId);
    return data;
  }

  // Update user by uuid
  async updateUser(userId: Types.ObjectId, userData: Partial<User>) {
    Logger.debug(
      `updateUser for id:${userId} called with payload: ${userData}`,
    );

    const data: User | null = await this.User.findByIdAndUpdate(
      userId,
      userData,
      {
        // new flag so the updated device is returned instead of old
        new: true,
      },
    );

    return data;
  }

  //Add GPS Log to Embedded Device using embedded device uuid
  async appendGPSLog(
    uuid: string,
    latitude: number,
    longitude: number,
    address: string,
  ) {
    Logger.log(
      `appendGPSLog call with location: "${latitude}, ${longitude}" and uuid: "${uuid}"`,
    );
    const embeddedDevice = await this.getEmbeddedDevice(uuid);

    if (embeddedDevice) {
      await this.updateEmbeddedDevice({
        uuid: uuid,
        gpsLog: [
          ...(Array.isArray(embeddedDevice.gpsLog)
            ? embeddedDevice.gpsLog
            : []),
          { latitude, longitude, address, time: Date.now() },
        ],
      });

      Logger.log(
        `SUCCESS: Location: "(${latitude}, ${longitude}) added to embedded device: "${uuid}"`,
      );
    } else {
      Logger.error(
        'In appendGPSLog: embedded device not found using provided uuid.',
      );
    }
  }
}

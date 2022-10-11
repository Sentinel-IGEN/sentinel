import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserMongooseSchema } from '../schemas/User.schema';
import { RegisterDeviceDTO } from 'src/schemas/dtos';

@Injectable()
export class MongoService implements OnApplicationBootstrap {
  private User = mongoose.model('User', UserMongooseSchema);

  onApplicationBootstrap() {
    // Connect to MongoDB on application bootstrap
    mongoose.connect(process.env.DB_URL, {
      autoIndex: true,
    });
    mongoose.connection.once('open', () => {
      console.log('MongoDB connection established');
    });
  }

  // Create User method, automatically hashes embeddedDeviceUUID before storing in DB
  async createUser(userData: RegisterDeviceDTO) {

    // Should enerate salted hash for embeddedDeviceUUID here and enter in place of embeddedDeviceUUID

    const newUser = new this.User({
      embeddedDeviceUUIDHash: userData.embeddedDeviceUUID,
      ...userData,
    });
    const data = await newUser.save();

    return data;
  }
}

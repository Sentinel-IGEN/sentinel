import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserMongooseSchema, User } from '../schemas/User.schema';

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

  async createUser(userData: User) {
    const newUser = new this.User(userData);
    const data = await newUser.save();

    return data;
  }
}

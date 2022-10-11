import { Schema } from 'mongoose';

//Define User schema
export interface User {
  embeddedDeviceUUIDHash: string; // hardware uuid, required on user creation, hashed version is stored in DB
  mobileDeviceToken?: string; // mobile device token/uuid
  endpointARN?: string; // platform endpoint ARN from AWS, for push notifications
  phoneNumber?: string; // optional, may be used to send sms notifications in addition to push
}

export const UserMongooseSchema = new Schema<User>({
  embeddedDeviceUUIDHash: { type: String, required: true, unqiue: true },
  mobileDeviceToken: { type: String, required: false, unqiue: true },
  endpointARN: { type: String, required: false, unqiue: true },
  phoneNumber: { type: String, required: false },
});

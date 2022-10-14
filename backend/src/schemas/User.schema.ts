import { Schema } from 'mongoose';

//Define User schema
export interface User {
  embeddedDeviceId: string; // hardware uuid, relates User to physical device
  endpointARN?: string; // platform endpoint ARN from AWS, for push notifications
  phoneNumber?: string; // optional, may be used to send sms notifications in addition to push
}

export const UserMongooseSchema = new Schema<User>({
  embeddedDeviceId: { type: String, required: true, unqiue: true },
  endpointARN: { type: String, unqiue: true },
  phoneNumber: { type: String },
});

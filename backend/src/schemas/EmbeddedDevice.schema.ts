import { Schema, Types } from 'mongoose';

//Define EmbeddedDevice schema
export interface EmbeddedDevice {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  tokenHash: string // hashed token for authorizing endpoint consumption by the embedded device
  userId?: Types.ObjectId // user uuid to relate to User object in DB
}

// Object in DB should be created when device is manufactured, so userId will not exist yet
export const EmbeddedDeviceMongooseSchema = new Schema<EmbeddedDevice>({
  uuid: { type: String, required: true, unqiue: true, index: true },
  tokenHash: { type: String, required: true, unqiue: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

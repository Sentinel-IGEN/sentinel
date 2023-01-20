import { Types } from 'mongoose';

export interface CreateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token: string; // token for authorizing endpoint consumption by the embedded device
  userId?: Types.ObjectId; // user uuid to relate to User object in DB
}

export interface UpdateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token?: string; // token for authorizing endpoint consumption by the embedded device
  userId?: Types.ObjectId; // user uuid to relate to User object in DB
}

export interface RegisterMobileDeviceTokenDTO {
  userId: Types.ObjectId;
  deviceToken: string;
  type: 'iOS' | 'Android';
}

export interface RegisterPhoneNumberDTO {
  phoneNumber: string;
}

export interface VerifyPhoneNumberDTO {
  userId: Types.ObjectId;
  phoneNumber: string;
  oneTimePassword: string;
}

export interface SendSMSDTO {
  phoneNumber: string;
  message: string;
}
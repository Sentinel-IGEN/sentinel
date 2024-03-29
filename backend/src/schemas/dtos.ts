import { Types } from 'mongoose';
import { gpsLog } from './EmbeddedDevice.schema';

export interface CreateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token: string; // token for authorizing endpoint consumption by the embedded device
  userId?: Types.ObjectId; // user uuid to relate to User object in DB
  gpsLog?: gpsLog[];
}

export interface UpdateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token?: string; // token for authorizing endpoint consumption by the embedded device
  userId?: Types.ObjectId; // user uuid to relate to User object in DB
  gpsLog?: gpsLog[];
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

export interface LockDeviceDTO {
  status: number; // 0: unlock, 1: lock
  device: string;
}

export interface MotionThresholdDTO {
  threshold: number; // 1 - 10
  device: string;
}

export interface alarmDTO {
  status: number; // 0:off, 1:on
  device: string;
}

export interface SendMQTTMessageDTO {
  topic: string;
  device: string;
  message: string;
}

export interface SendSMSDTO {
  phoneNumber: string;
  message: string;
}

export interface MqttDTO {
  device: string;
  topic: string;
  payload: string;
}

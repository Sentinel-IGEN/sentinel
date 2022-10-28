export interface CreateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token: string // token for authorizing endpoint consumption by the embedded device
  userId?: string // user uuid to relate to User object in DB
}

export interface UpdateDeviceDTO {
  uuid: string; // hardware uuid to uniquely identify device, created on physical device creation
  token?: string // token for authorizing endpoint consumption by the embedded device
  userId?: string // user uuid to relate to User object in DB
}

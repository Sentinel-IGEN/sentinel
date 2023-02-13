import { atom } from "recoil";

const RegisteredState = atom({
  key: "registeredState",
  default: false,
});

const LockState = atom({
  key: "lockState",
  default: false,
});

const LockLoadingState = atom({
  key: "lockLoadingState",
  default: false,
});

const AlarmState = atom({
  key: "alarmState",
  default: false,
});

const AlarmLoadingState = atom({
  key: "alarmLoadingState",
  default: false,
});

export {
  RegisteredState,
  LockState,
  LockLoadingState,
  AlarmState,
  AlarmLoadingState,
};

import { atom } from "recoil";

const RegisteredState = atom({
    key: "registeredState",
    default: false
});

const LockState = atom({
    key: "lockState",
    default: false
})

const LockLoadingState = atom({
    key: "lockLoadingState",
    default: false
})

export {RegisteredState, LockState, LockLoadingState};
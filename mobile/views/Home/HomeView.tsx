import { useState, useRef, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useSetRecoilState } from "recoil";
import { WS_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from "./MapView";
import { sendPostRequest } from "../../helpers/Requests";
import {
  LockLoadingState,
  LockState,
  DeviceHeartBeatState,
  DeviceConnectionState,
  bikeGPSState,
} from "../../recoil_state";
import BottomModal from "../../components/BottomModal";

interface WebSocketMessage {
  topic: string;
  payload: string;
}

interface WebSocketReplyGPSMessage {
  topic: string;
  payload: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const createTwoButtonAlert = () => {
  Alert.alert("Motion detected", "Your sentinel bike tag may be moving.", [
    { text: "OK", onPress: () => console.log("OK") },
    {
      text: "Turn off alarm",
      onPress: async () => {
        const embeddedDeviceId = await AsyncStorage.getItem(
          "@embeddedDeviceId"
        );
        sendPostRequest("toggleAlarm", { status: 0, device: embeddedDeviceId });
      },
    },
  ]);
};

const HomeView = () => {
  const setLockState = useSetRecoilState(LockState);
  const setLockLoading = useSetRecoilState(LockLoadingState);
  const setDeviceHeartBeat = useSetRecoilState(DeviceHeartBeatState);
  const setDeviceConnectionState = useSetRecoilState(DeviceConnectionState);
  const setBikeGPSState = useSetRecoilState(bikeGPSState);
  const [motionDetectTime, setMotionDetectTime] = useState(Date.now());

  const ws = useRef(new WebSocket(WS_URL)).current;

  ws.onopen = async () => {
    const embeddedDeviceId = await AsyncStorage.getItem("@embeddedDeviceId");
    const data = { command: "register", device: embeddedDeviceId }; //TODO: change to actual device
    ws.send(JSON.stringify(data));
  };

  ws.onmessage = (data) => {
    console.log(data.data);
    try {
      const serializedData: WebSocketMessage | WebSocketReplyGPSMessage =
        JSON.parse(data.data);
      switch (serializedData.topic) {
        case "lock_status":
          setLockState(serializedData.payload == "1");
          setLockLoading(false);
          AsyncStorage.setItem("@lockStatus", serializedData.payload as string);
          break;
        case "motion_status":
          if (serializedData.payload == "1") {
            if (Date.now() - motionDetectTime > 3000) {
              setMotionDetectTime(Date.now());
              createTwoButtonAlert();
            }
          }
          break;
        case "device_health":
          if (serializedData.payload == "1") {
            const currentTime = Date.now();
            AsyncStorage.setItem("@lastHeartBeatTime", currentTime.toString());
            console.log(currentTime, currentTime.toString());
            setDeviceHeartBeat(currentTime);
            setDeviceConnectionState(true);
          }
          break;
        case "gps":
          if (!serializedData.payload) break;
          const data = serializedData as WebSocketReplyGPSMessage;
          setBikeGPSState({
            latitude: data.payload.latitude,
            longitude: data.payload.longitude,
            address: data.payload.address,
          });
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const lockStatus = await AsyncStorage.getItem("@lockStatus");
        const embeddedDeviceId = await AsyncStorage.getItem(
          "@embeddedDeviceId"
        );
        if (lockStatus) {
          // Re-sync with device
          const lockState = lockStatus == "1";
          setLockState(lockState);
          sendPostRequest("toggleLock", {
            status: lockState,
            device: embeddedDeviceId,
          });
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return (
    <View>
      <MapView style={styles.map} />
      <BottomModal />
    </View>
  );
};

const styles = StyleSheet.create({
  map: { height: "100%", width: "100%" },
});

export default HomeView;

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

const createTwoButtonAlert = () => {
  Alert.alert("Motion detected", "Your sentinel bike tag may be moving.", [
    { text: "OK", onPress: () => console.log("OK") },
    {
      text: "Turn off alarm",
      onPress: async () =>
        sendPostRequest("toggleAlarm", { status: 0, device: "device1" }),
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

  ws.onopen = () => {
    const data = { command: "register", device: "device1" };
    ws.send(JSON.stringify(data));
  };

  ws.onmessage = (data) => {
    console.log(data.data);
    try {
      const serializedData: WebSocketMessage = JSON.parse(data.data);
      switch (serializedData.topic) {
        case "lock_status":
          setLockState(serializedData.payload == "1");
          setLockLoading(false);
          AsyncStorage.setItem("@lockStatus", serializedData.payload);
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
          const location = serializedData.payload.split(",");
          let [lat, lon] = [location[0], location[1]];
          setBikeGPSState({ latitude: Number(lat), longitude: Number(lon) });
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
        if (lockStatus) {
          // Re-sync with device
          const lockState = lockStatus == "1";
          setLockState(lockState);
          sendPostRequest("toggleLock", {
            status: lockState,
            device: "device1",
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

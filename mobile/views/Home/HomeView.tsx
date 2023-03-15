import React from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useSetRecoilState } from "recoil";
import { WS_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from "./MapView";
import { sendPostRequest } from "../../helpers/Requests";
import { LockLoadingState, LockState, DeviceHeartBeatState, DeviceConnectionState } from "../../recoil_state";
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
  const [motionDetectTime, setMotionDetectTime] = React.useState(Date.now());

  const ws = React.useRef(new WebSocket(WS_URL));

  ws.current.onopen = () => {
    const data = { command: "register", device: "device1" };
    ws.current.send(JSON.stringify(data));
  };

  ws.current.onmessage = (data) => {
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
            setDeviceHeartBeat(Date.now());
            setDeviceConnectionState(true);
          }
          else {
            setDeviceConnectionState(false);
            Alert.alert("Device disconnected.");
          }
          console.log("Device health");
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn(e);
    }
  };

  React.useEffect(() => {
    const loadAsyncStorage = async () => {
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
    };
    loadAsyncStorage();
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

import { useEffect } from "react";
import { DeviceHeartBeatState, DeviceConnectionState } from "../recoil_state";
import { useRecoilState } from "recoil";
import { Alert, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DeviceConnectionStatusBar = () => {
  const [deviceHeartBeat, setDeviceHeartBeat] =
    useRecoilState(DeviceHeartBeatState);
  const [connected, setConnected] = useRecoilState(DeviceConnectionState);

  useEffect(() => {
    const interval = setInterval(() => {
      const newConnectionStatus = deviceHeartBeat + 15_000 > Date.now();
      if (connected && !newConnectionStatus) {
        Alert.alert(
          "Your Sentinel bike tag has disconnected!",
          "",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ],
          { cancelable: false }
        );
      }
      setConnected(newConnectionStatus);
    }, 10_000);

    return () => clearInterval(interval);
  }, [deviceHeartBeat, connected]);

  useEffect(() => {
    (async () => {
      const lastConnected = await AsyncStorage.getItem("@lastHeartBeatTime");
      if (lastConnected) setDeviceHeartBeat(Number(lastConnected));
    })();
  }, []);

  const ConnectedStatusBar = () => (
    <>
      <Text style={styles.connectedText}>Connected</Text>
    </>
  );

  const DisconnectedStatusBar = () => {
    const lastHeartBeatTime = new Date(deviceHeartBeat);

    return (
      <Text style={styles.disconnectedText}>
        Last connected: {lastHeartBeatTime.toLocaleDateString()}{" "}
        {lastHeartBeatTime.toLocaleTimeString()}
      </Text>
    );
  };

  return connected ? <ConnectedStatusBar /> : <DisconnectedStatusBar />;
};

const styles = StyleSheet.create({
  connectedText: {
    color: "green",
    marginLeft: 20,
    paddingTop: 2,
  },
  disconnectedText: {
    color: "gray",
    marginLeft: 20,
    paddingTop: 2,
  },
});

export default DeviceConnectionStatusBar;

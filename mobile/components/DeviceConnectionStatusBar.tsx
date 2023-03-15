import React from "react";
import { DeviceHeartBeatState, DeviceConnectionState } from "../recoil_state";
import { useRecoilState, useRecoilValue } from "recoil";
import { StyleSheet, Text, View } from "react-native";


const DeviceConnectionStatusBar = () => {
    const deviceHeartBeat = useRecoilValue(DeviceHeartBeatState);
    const [connected, setConnected] = useRecoilState(DeviceConnectionState);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setConnected(deviceHeartBeat + 15_000 > Date.now());
        }, 10_000);

        return () => clearInterval(interval);
    }, [deviceHeartBeat])

    const ConnectedStatusBar = () => (<>
        <Text style={styles.connectedText}>Connected</Text>
    </>)

    const DisconnectedStatusBar = () => {
        const lastHeartBeatTime = new Date(deviceHeartBeat);

        return <Text style={styles.disconnectedText}>Last connected: {lastHeartBeatTime.toLocaleDateString()} {lastHeartBeatTime.toLocaleTimeString()}</Text>
   
    }

    return connected ? <ConnectedStatusBar /> : <DisconnectedStatusBar />;

}

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
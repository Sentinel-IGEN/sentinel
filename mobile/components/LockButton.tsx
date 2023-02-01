import React from "react";
import { Button } from "react-native";

export default function LockButton() {
    const ws = React.useRef(new WebSocket('ws://localhost:3000'));
    ws.current.onopen = () => {
      const data = {command: 'register', device: 'device1'};
      ws.current.send(JSON.stringify(data));
    }
  
    ws.current.onmessage = data => {
      console.log(data.data);
    }
  
    const [lockState, setLockState] = React.useState(false);
  
    const toggleLock = () => {
      const data = {command: lockState ? 'unlock' : 'lock'};
      setLockState(state => !state);
      ws.current.send(JSON.stringify(data));
    }

    return(
      <Button color='#007AFF' title={lockState ? "Unlock" : "Lock"} onPress={toggleLock}></Button>
    )

}
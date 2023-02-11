import React from "react";
import { Button } from "@rneui/themed";
import { useRecoilState, useRecoilValue } from "recoil";
import { LockLoadingState, LockState } from "../../recoil_state";
import { StyleSheet } from "react-native";
import { sendPostRequest } from "../../helpers/Requests";

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    marginLeft: 12,
    marginRight: 12,
    marginTop: 12,
    borderRadius: 6,
  },
});

export default function LockButton(props) {
  const lockState = useRecoilValue(LockState);
  const [isLoading, setIsLoading] = useRecoilState(LockLoadingState);

  const toggleLock = async () => {
    setIsLoading(true);
    sendPostRequest("mobile/toggleLock", {
      status: !lockState,
      device: "device1",
    });
  };

  return (
    <Button
      containerStyle={styles.button}
      color="#007AFF"
      loading={isLoading}
      title={lockState ? "Unlock" : "Lock"}
      onPress={toggleLock}
      {...props}
    />
  );
}

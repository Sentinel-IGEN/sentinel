import React from "react";
import { Button } from "@rneui/themed";
import { useRecoilState, useRecoilValue } from "recoil";
import { LockLoadingState, LockState } from "../../recoil_state";
import { StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";
import { sendPostRequest } from "../../helpers/Requests";

export default function LockButton(props) {
  const lockState = useRecoilValue(LockState);
  const [isLoading, setIsLoading] = useRecoilState(LockLoadingState);

  const toggleLock = async () => {
    setIsLoading(true);
    sendPostRequest("toggleLock", {
      status: !lockState,
      device: "device1",
    });
  };

  const LockIcon = React.useMemo(() => {
    return lockState ? (
      <Icon
        containerStyle={styles.icon}
        type="antdesign"
        name="unlock"
        size={30}
        color="white"
      />
    ) : (
      <Icon
        containerStyle={styles.icon}
        type="antdesign"
        name="lock"
        size={30}
        color="white"
      />
    );
  }, [lockState]);

  return (
    <Button
      color="#091156"
      containerStyle={styles.buttonContainer}
      buttonStyle={styles.button}
      titleStyle={styles.buttonTitle}
      loading={isLoading}
      title={lockState ? "Unlock" : "Lock"}
      onPress={toggleLock}
      radius="md"
      icon={LockIcon}
      iconPosition="top"
    />
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "50%",
    margin: 10,
  },
  icon: {
    margin: 10,
    marginBottom: 2,
    color: "white",
  },
  button: {
    height: 100,
    marginLeft: 20,
    marginRight: 5,
  },
  buttonTitle: {
    color: "white",
    fontWeight: "300",
  },
});

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
    sendPostRequest("mobile/toggleLock", {
      status: !lockState,
      device: "device1",
    });
  };

  const LockIcon = React.useMemo(() => {
    return lockState ? (
      <Icon containerStyle={styles.icon} type="antdesign" name="lock-open" size={30} />
    ) : (
      <Icon containerStyle={styles.icon} type="antdesign" name="lock" size={30} />
    );
  }, [lockState]);

  return (
    <Button
      containerStyle={styles.container}
      buttonStyle={styles.button}
      color="#B6A9D1"
      titleStyle={{ color: "black" }}
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
  container: {
    width: "50%",
    margin: 10,
  },
  icon: {
    margin: 10,
  },
  button: {
    height: 100,
    marginLeft: 20,
    marginRight: 10,
  },
});

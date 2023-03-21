import React from "react";
import { Button, Icon } from "@rneui/themed";
import { StyleSheet } from "react-native";
import { sendPostRequest } from "../helpers/Requests";

export default function AlarmButton() {
  const [alarmStatus, setAlarm] = React.useState(false);

  const AlarmIcon = React.useMemo(() => {
    return alarmStatus ? (
      <Icon
        containerStyle={styles.icon}
        type="font-awesome"
        name="bell-slash-o"
        color="white"
        size={30}
      />
    ) : (
      <Icon
        containerStyle={styles.icon}
        type="font-awesome"
        name="bell-o"
        color="white"
        size={30}
      />
    );
  }, [alarmStatus]);

  const toggleAlarm = async () => {
    sendPostRequest("toggleAlarm", { status: !alarmStatus, device: "device1" }); //TODO: Change to actual device id
    setAlarm((status) => !status);
    setTimeout(() => setAlarm(false), 7000);
  };

  return (
    <Button
      containerStyle={styles.buttonContainer}
      buttonStyle={styles.button}
      titleStyle={styles.buttonTitle}
      color="#091156"
      loading={false}
      title={alarmStatus ? "Stop alarm" : "Ring alarm"}
      radius="md"
      icon={AlarmIcon}
      iconPosition="top"
      onPress={toggleAlarm}
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
    marginLeft: 5,
    marginRight: 20,
  },
  buttonTitle: {
    color: "white",
    fontWeight: "300",
  },
});

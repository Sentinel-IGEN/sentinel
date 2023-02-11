import React from "react";
import { Button, Icon } from "@rneui/themed";
import { StyleSheet } from "react-native";

export default function AlarmButton() {
  const [alarmStatus, setAlarm] = React.useState(false);

  const AlarmIcon = React.useMemo(() => {
    return alarmStatus ? (
      <Icon containerStyle={styles.icon} type="font-awesome" name="bell-slash-o" size={30} />
    ) : (
      <Icon containerStyle={styles.icon} type="font-awesome" name="bell-o" size={30} />
    );
  }, [alarmStatus]);

  return (
    <Button
      containerStyle={styles.container}
      buttonStyle={styles.button}
      titleStyle={{ color: "black" }}
      color="#B6A9D1"
      loading={false}
      title={alarmStatus ? "Stop alarm" : "Ring alarm"}
      radius="md"
      icon={AlarmIcon}
      iconPosition="top"
      onPress={() => setAlarm((alarm) => !alarm)}
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
    marginRight: 20,
    marginLeft: 10,
  },
});

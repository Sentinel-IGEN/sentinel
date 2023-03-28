import React from "react";
import { StyleSheet, View } from "react-native";
import { Slider, Icon } from "@rneui/themed";
import { debounce } from "lodash";
import { sendPostRequest } from "../helpers/Requests";
import { Text } from "@rneui/base";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AlarmSensitivitySlider = () => {
  const onValueChange = React.useRef(
    debounce(async (value: Number) => {
      const embeddedDeviceId = await AsyncStorage.getItem("@embeddedDeviceId");
      await sendPostRequest("setMotionThreshold", {
        device: embeddedDeviceId,
        threshold: 10 - Number(value),
      });
    }, 500)
  ).current;

  React.useEffect(() => {
    return () => {
      onValueChange.cancel();
    };
  }, [onValueChange]);

  return (
    <View style={styles.container}>
      <Slider
        onValueChange={onValueChange}
        maximumValue={9}
        minimumValue={0}
        step={1}
        allowTouchTrack
        trackStyle={{ height: 6, backgroundColor: "transparent" }}
        thumbStyle={{ height: 20, width: 20, backgroundColor: "transparent" }}
        thumbProps={{
          children: (
            <Icon
              type="material-community"
              name="motion-sensor"
              size={14}
              containerStyle={{ bottom: 14, right: 14 }}
              color="#091156"
              reverse
            />
          ),
        }}
      />
      <View style={styles.textContainer}>
        <Text>Less sensitive</Text>
        <Text>More sensitive</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EDEDED",
    padding: 22,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default AlarmSensitivitySlider;

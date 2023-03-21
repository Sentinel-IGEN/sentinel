import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import AlarmButton from "./AlarmButton";
import AlarmSensitivitySlider from "./AlarmSensitivitySlider";
import LockButton from "../views/Home/LockButton";
import ClearAsyncStorageButton from "../views/Home/ClearAsyncStorageButton";
import DeviceConnectionStatusBar from "./DeviceConnectionStatusBar";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

interface Props {
  animatedIndex: SharedValue<number>;
}

const BottomModalContent = (props: Props) => {
  const { animatedIndex } = props;
  const [deviceName, setDeviceName] = useState("Sentinel");

  const navigation = useNavigation();

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        animatedIndex.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  }, [animatedIndex]);

  useEffect(() => {
    (async () => {
      let name = await AsyncStorage.getItem("@deviceName");
      if (name) {
        setDeviceName(name);
      }
    })();
  }, []);

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{deviceName}'s Bike Tag</Text>
      <Text style={styles.address}>576 West 44th Ave, Vancouver V3X 7T3</Text>
      <DeviceConnectionStatusBar />
      <View style={styles.buttonContainer}>
        <LockButton />
        <AlarmButton />
      </View>
      <Animated.View style={[styles.sliderContainer, containerAnimatedStyle]}>
        <Text style={styles.motionSensitivity}>Motion Sensitivity</Text>
        <AlarmSensitivitySlider />
      </Animated.View>
      <Button
        title="View Bike's Location History"
        containerStyle={styles.openBikeLocationHistoryButton}
        onPress={() => navigation.navigate("LocationHistory" as never)}
        {...props}
      />
      <ClearAsyncStorageButton />
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    padding: 20,
    paddingTop: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  title: {
    padding: 5,
    marginLeft: 15,
    fontSize: 22,
    fontWeight: "600",
  },
  motionSensitivity: {
    fontSize: 18,
    fontWeight: "600",
    paddingBottom: 5,
  },
  addressContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    alignSelf: "baseline",
    padding: 5,
    paddingHorizontal: 10,
    marginLeft: 15,
    borderRadius: 20,
  },
  address: {
    color: "grey",
    marginLeft: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  openBikeLocationHistoryButton: {
    alignSelf: "stretch",
    marginLeft: 24,
    marginRight: 24,
    marginTop: 12,
    borderRadius: 6,
  },
});

export default BottomModalContent;

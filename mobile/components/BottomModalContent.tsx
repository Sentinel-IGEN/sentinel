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
import { Icon } from "@rneui/themed";

interface Props {
  animatedIndex: SharedValue<number>;
}

const BottomModalContent = (props: Props) => {
  const { animatedIndex } = props;

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

  return (
    <View style={styles.contentContainer}>
      <View style={styles.addressContainer}>
        <Icon name="gps-fixed" type="material" />
        <Text style={styles.address}>576 West 44th Ave, Vancouver V3X 7T3</Text>
      </View>
      <View style={styles.buttonContainer}>
        <LockButton />
        <AlarmButton />
      </View>
      <Animated.View style={[styles.sliderContainer, containerAnimatedStyle]}>
        <AlarmSensitivitySlider />
      </Animated.View>
      <ClearAsyncStorageButton />
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    padding: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
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
    color: "black",
    paddingHorizontal: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default BottomModalContent;

import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import LockButton from "./LockButton";
import AlarmButton from "./AlarmButton";
import AlarmSensitivitySlider from "./AlarmSensitivitySlider";
import { Icon } from "@rneui/base";

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
      <Text style={styles.address}>576 West 44th Ave, Vancouver V3X 7T3</Text>
      <View style={styles.buttonContainer}>
        <LockButton />
        <AlarmButton />
      </View>
      <Animated.View style={[styles.sliderContainer, containerAnimatedStyle]}>
        <AlarmSensitivitySlider />
      </Animated.View>
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
  address: {
    paddingLeft: 15,
    color: "white",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#525267",
  },
});

export default BottomModalContent;

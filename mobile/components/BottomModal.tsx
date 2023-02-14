import React, { useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomModalContent from "./BottomModalContent";
import { useSharedValue } from "react-native-reanimated";

const BottomModal = () => {
  const bottomSheetRef = useRef<BottomSheet>();
  const snapPoints = useMemo(() => ["25%", "50%", "92%"], []);
  const animatedIndex = useSharedValue(0);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      style={styles.sheet}
      animatedIndex={animatedIndex}
      animateOnMount={true}
    >
      <BottomModalContent animatedIndex={animatedIndex} />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,

    elevation: 11,
    backgroundColor: "white",
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
  },
});

export default BottomModal;

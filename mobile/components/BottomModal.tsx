import React, { useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomModalContent from "./BottomModalContent";
import {useSharedValue} from "react-native-reanimated";
import { Icon } from "@rneui/base";

const BottomModal = () => {
  const bottomSheetRef = useRef<BottomSheet>();
  const snapPoints = useMemo(() => ["25%", "50%", "92%"], []);
  const animatedIndex = useSharedValue(0);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      handleStyle={styles.handle}
      animatedIndex={animatedIndex}
     animateOnMount={true}
    >
      <BottomModalContent animatedIndex={animatedIndex}/>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: "#525267",
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
  },
 
});

export default BottomModal;

import React, { useState } from "react";
import { Slider, Icon } from "@rneui/themed";
import { debounce } from "lodash";
import { sendPostRequest } from "../helpers/Requests";

const AlarmSensitivitySlider = () => {
  const onValueChange = React.useRef(
    debounce(async (value: Number) => {
      await sendPostRequest("setMotionThreshold", {
        device: "device1",
        threshold: value,
      })
    }, 500)
  ).current;

  React.useEffect(() => {
    return () => {
      onValueChange.cancel();
    }
  }, [onValueChange])

  return (
    <Slider
      onValueChange={onValueChange}
      maximumValue={10}
      minimumValue={0}
      step={1}
      allowTouchTrack
      trackStyle={{ height: 5, backgroundColor: "transparent" }}
      thumbStyle={{ height: 20, width: 20, backgroundColor: "transparent" }}
      thumbProps={{
        children: (
          <Icon
            type="material-community"
            name="motion-sensor"
            size={20}
            containerStyle={{ bottom: 20, right: 20 }}
            color="#2E2647"
            reverse
          />
        ),
      }}
    />
  );
};

export default AlarmSensitivitySlider;

import React, { useState } from "react";
import { Slider, Icon } from "@rneui/themed";

const AlarmSensitivitySlider = () => {
  const [value, setValue] = useState(0);
  return (
    <Slider
      value={value}
      onValueChange={setValue}
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

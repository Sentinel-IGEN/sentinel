import { ThemeProvider, createTheme } from "@rneui/themed";

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RecoilRoot } from "recoil";
import NavigationStackView from "./views/NavigationStackView";

const theme = createTheme({
  mode: "light",
  lightColors: {
    primary: "#6562FF",
  },
  components: {
    Text: {
      h1Style: {
        fontWeight: "bold",
        fontSize: 36,
        color: "#171587",
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationStackView />
        </GestureHandlerRootView>
      </RecoilRoot>
    </ThemeProvider>
  );
}

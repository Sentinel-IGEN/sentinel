import { ThemeProvider, createTheme } from "@rneui/themed";

import React from "react";
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
        // fontFamily: "Roboto",
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
        <NavigationStackView />
      </RecoilRoot>
    </ThemeProvider>
  );
}

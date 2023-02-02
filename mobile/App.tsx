import { SafeAreaView } from "react-native";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConnectDeviceView from "./views/ConnectDeviceView";
import ConnectPhoneView from "./views/ConnectPhoneView";
import VerifyPhoneView from "./views/VerifyPhoneView";
import HomeView from "./views/HomeView";

const Stack = createNativeStackNavigator();

const theme = createTheme({
  mode: "light",
  lightColors: {
    primary: "#6562FF",
  },
  components: {
    Text: {
      h1Style: {
        fontFamily: "Roboto",
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
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator
            screenOptions={{
              headerShadowVisible: false,
              title: "",
              headerStyle: {
                backgroundColor: "#F2F2F2",
              },
              headerTintColor: "#222222",
            }}>
            <Stack.Screen name="ConnectDevice" component={ConnectDeviceView} />
            <Stack.Screen name="ConnectPhone" component={ConnectPhoneView} />
            <Stack.Screen name="VerifyPhone" component={VerifyPhoneView} />
            <Stack.Screen name="Home" component={HomeView} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
}

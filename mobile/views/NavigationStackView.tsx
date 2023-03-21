import { SafeAreaView } from "react-native";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConnectDeviceView from "./Registration/ConnectDeviceView";
import ConnectPhoneView from "./Registration/ConnectPhoneView";
import VerifyPhoneView from "./Registration/VerifyPhoneView";
import HomeView from "./Home/HomeView";
import LocationHistory from "./LocationHistory/LocationHistory";

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisteredState } from "../recoil_state";
import { useRecoilState } from "recoil";
import DeviceNameView from "./Registration/DeviceNameView";

const Stack = createNativeStackNavigator();

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

export default function NavigationStackView() {
  const [isRegistered, setRegistered] = useRecoilState(RegisteredState);

  React.useEffect(() => {
    (async () => {
      try {
        const userId = await AsyncStorage.getItem("@userId");
        const embeddedDeviceId = await AsyncStorage.getItem("@embeddedDeviceId");
        if (userId && embeddedDeviceId) {
          console.log(
            "Found user ID in storage (user is registered): " + userId
          );
          console.log(
            "Found embeddedDeviceId in storage (user is registered): " + embeddedDeviceId
          );
          setRegistered(true);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            title: "",
            headerStyle: {
              backgroundColor: "#F2F2F2",
            },
            headerTintColor: "#222222",
          }}
        >
          {!isRegistered && (
            <>
              {/* Registration views */}
              <Stack.Screen
                name="ConnectDevice"
                component={ConnectDeviceView}
              />
              <Stack.Screen name="DeviceName" component={DeviceNameView} />
              <Stack.Screen name="ConnectPhone" component={ConnectPhoneView} />
              <Stack.Screen name="VerifyPhone" component={VerifyPhoneView} />
              {/* End registration views */}
            </>
          )}
          <Stack.Screen
            name="Home"
            options={{
              headerShown: false,
            }}
            component={HomeView}
          />
          <Stack.Screen
            name="LocationHistory"
            component={LocationHistory}
            options={{ title: "Bike Location History" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

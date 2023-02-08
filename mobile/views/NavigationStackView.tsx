import { SafeAreaView } from "react-native";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConnectDeviceView from "./ConnectDeviceView";
import ConnectPhoneView from "./ConnectPhoneView";
import VerifyPhoneView from "./VerifyPhoneView";
import HomeView from "./HomeView";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisteredState } from "../recoil_state";
import { useRecoilState } from "recoil";

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
      const loadEmbeddedDeviceID = async () => {
        try {
          const embeddedDeviceID = await AsyncStorage.getItem("@embeddedDeviceId");
          if (embeddedDeviceID) {
            console.log("Found embedd device ID in storage: " + embeddedDeviceID);
            setRegistered(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
      loadEmbeddedDeviceID();
    }, [])
  
    return (
      <ThemeProvider theme={theme}>
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F2"}}>
              <Stack.Navigator
                screenOptions={{
                  headerShadowVisible: false,
                  title: "",
                  headerStyle: {
                    backgroundColor: "#F2F2F2",
                  },
                  headerTintColor: "#222222",
                }}>
                {isRegistered ? 
                (<>
                  <Stack.Screen name="Home" options={{ title: 'Home' }} component={HomeView} />
                </>) : (
                <>
                  <Stack.Screen name="ConnectDevice" component={ConnectDeviceView} />
                  <Stack.Screen name="ConnectPhone" component={ConnectPhoneView} />
                  <Stack.Screen
                    name="VerifyPhone"
                    component={VerifyPhoneView} />
                    <Stack.Screen name="Home" options={{ title: 'Home' }} component={HomeView} />
                </>)}
              </Stack.Navigator>
            </SafeAreaView>
          </NavigationContainer>
      </ThemeProvider>
    );
  }
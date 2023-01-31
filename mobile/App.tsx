import { SafeAreaView } from "react-native";
import { ThemeProvider, createTheme } from "@rneui/themed";
import ConnectDeviceView from "./views/ConnectDeviceView";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
          <Stack.Navigator>
            <Stack.Screen name="ConnectDevice" component={ConnectDeviceView} />
          </Stack.Navigator>
          <ConnectDeviceView />
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
}

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import PushNotifications from "./components/PushNotifications";
import LockButton from "./components/LockButton";

export default function App() {


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <LockButton />
      {/* <PushNotifications /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

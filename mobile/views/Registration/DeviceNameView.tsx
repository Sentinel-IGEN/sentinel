import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "@rneui/base";

const DeviceNameView = ({ navigation }) => {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    await AsyncStorage.setItem("@deviceName", value);
    navigation.push("ConnectPhone");
  };

  return (
    <View style={styles.viewRoot}>
      <Text h1 style={styles.header}>
        Name your bike tag
      </Text>
      <Input
        style={styles.input}
        containerStyle={{ margin: 0 }}
        inputContainerStyle={styles.inputContainer}
        autoFocus={true}
        placeholder="Sentinel bike tag name"
        onChangeText={(input) => setValue(input)}
      />
      <Text style={styles.infoText}>
        Enter a name for your Sentinel bike tag.
      </Text>
      <Button
        containerStyle={styles.button}
        onPress={handleSubmit}
        disabled={value.length == 0}
      >
        DONE
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  viewRoot: {
    flex: 1,
    flexDirection: "column",
    padding: 20,
    alignItems: "center",
  },
  header: {
    marginTop: "20%",
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  input: {
    marginTop: 20,
    marginHorizontal: "auto",
    borderColor: "#171587",
    borderWidth: 1,
    padding: 16,
    borderRadius: 6,
  },
  infoText: {
    marginTop: -15,
    color: "#484848",
  },
  button: {
    marginTop: 36,
    alignSelf: "stretch",
    marginHorizontal: 12,
    borderRadius: 6,
  },
});

export default DeviceNameView;

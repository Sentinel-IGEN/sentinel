import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendPostRequest } from "../../helpers/Requests";

const ConnectDeviceView = ({ navigation }) => {
  const [value, setValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const renderCell = ({ index, symbol, isFocused }) => (
    <View key={index} style={[styles.cellRoot, isFocused && styles.focusCell]}>
      <Text style={styles.cellText}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </Text>
    </View>
  );

  const handleSubmit = async () => {
    try {
      setIsFetching(true);

      const res = await sendPostRequest("", {
        embeddedDeviceId: value.toLowerCase(),
      });
      const content = await res.json();
      console.log("User created");
      console.log(content);

      try {
        if (content._id) {
          AsyncStorage.setItem("@userId", content._id);
        }
      } catch (e) {
        console.log("error saving user connection info");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsFetching(false);
      navigation.push("DeviceName");
    }
  };

  return (
    <View style={styles.viewRoot}>
      <Text h1 style={styles.header}>
        Connect your bike
      </Text>
      <CodeField
        value={value}
        onChangeText={setValue}
        cellCount={6}
        textContentType="oneTimeCode"
        renderCell={renderCell}
        rootStyle={styles.codeFiledRoot}
      />
      <Text style={styles.infoText}>
        Please enter the Sentinel authentication code in your included
        registration card.
      </Text>
      <Button
        containerStyle={styles.connectButton}
        onPress={handleSubmit}
        disabled={value.length < 6 || isFetching}
      >
        CONNECT
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
  codeFiledRoot: {
    marginTop: 20,
    width: 320,
    marginLeft: "auto",
    marginRight: "auto",
    borderColor: "#171587",
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
  },
  cellRoot: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  cellText: {
    color: "#000",
    fontSize: 28,
    textAlign: "center",
    textTransform: "uppercase",
  },
  focusCell: {
    borderBottomColor: "#6562FF",
    borderBottomWidth: 1,
  },
  infoText: {
    color: "#484848",
    marginTop: 12,
  },
  connectButton: {
    marginTop: 36,
    alignSelf: "stretch",
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 6,
  },
});

export default ConnectDeviceView;

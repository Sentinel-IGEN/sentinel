import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';


const ConnectDeviceView = () => {
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
      setIsFetching(true)

      const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeddedDeviceId: value.toLowerCase() }),
      });

      const content = await res.json();
      
      // save data in local storage
      try {
        await AsyncStorage.multiSet([['@userId', content._id], ['@embeddedDeviceId', content.embeddedDeviceId]])
      } catch (e) {
        console.log("error saving user connection info")
      }

    } catch (err) {
      console.log(err);
    } finally {
      setIsFetching(false)
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text h1>Connect your bike</Text>
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
      <Button containerStyle={styles.connectButton} onPress={handleSubmit} disabled={value.length < 6 || isFetching}>
        CONNECT
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
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

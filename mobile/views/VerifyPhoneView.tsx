import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "@rneui/themed";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { RegisteredState } from "../recoil_state";


const VerifyPhoneView = () => {
  const [value, setValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const setRegistered = useSetRecoilState(RegisteredState);

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
      const userId = await AsyncStorage.getItem("@userId");
      const phoneNumber = await AsyncStorage.getItem("@phoneNumber");

      const res = await fetch(`${API_URL}/verifyPhoneNumber`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, userId, oneTimePassword: value }),
      });

      const content = await res.json();
      console.log(content);
    } catch (err) {
      console.log(err);
    } finally {
      setIsFetching(false);

      // Switch views
      // Technically this should occur only if the verification is successful, 
      // but we aren't handling error states at the moment, so the view will always change for the time being.
      setRegistered(true);
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
      }}>
      <Text h1>Verify Your Phone</Text>
      <CodeField
        value={value}
        onChangeText={setValue}
        cellCount={6}
        textContentType="oneTimeCode"
        renderCell={renderCell}
        rootStyle={styles.codeFiledRoot}
        keyboardType="numeric"
      />
      <Text style={styles.infoText}>
        Enter the one time password that was sent to your device.
      </Text>
      <Button
        containerStyle={styles.connectButton}
        onPress={handleSubmit}
        disabled={value.length < 6 || isFetching}>
        VERIFY
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

export default VerifyPhoneView;

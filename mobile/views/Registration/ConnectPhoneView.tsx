import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text, Button } from "@rneui/themed";
import PhoneInput from "react-native-phone-number-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendPostRequest } from "../../helpers/Requests";

const ConnectPhoneView = ({ navigation }) => {
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  const phoneInput = React.useRef<PhoneInput>(null);

  const handleSubmit = async () => {
    try {
      setIsFetching(true);

      const res = await sendPostRequest("registerPhoneNumber", {
        phoneNumber: formattedValue,
      });

      const content = await res.json();
      console.log(content);

      // save phone number is local storage
      await AsyncStorage.setItem("@phoneNumber", formattedValue);
    } catch (err) {
      console.log(err);
    } finally {
      setIsFetching(false);

      // switch views
      // technically this should only occur if request was successful, but we aren't handling error states at the moment
      navigation.push("VerifyPhone");
    }
  };

  return (
    <View style={styles.viewRoot}>
      <Text h1 style={styles.header}>
        Connect your phone
      </Text>
      <PhoneInput
        ref={phoneInput}
        defaultValue={value}
        defaultCode="CA"
        layout="first"
        onChangeText={setValue}
        onChangeFormattedText={setFormattedValue}
        withDarkTheme
        withShadow
        autoFocus
        containerStyle={styles.phoneInputContainer}
      />
      <Text style={styles.infoText}>
        Register your phone number to get instant alerts and keep your bike
        safe.
      </Text>
      <Button
        containerStyle={styles.connectButton}
        onPress={handleSubmit}
        disabled={value.length < 6 || isFetching}
      >
        SEND VERIFICATION CODE
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
  phoneInputContainer: {
    marginTop: 12,
  },
});

export default ConnectPhoneView;

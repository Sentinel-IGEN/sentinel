import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { CodeField, Cursor } from "react-native-confirmation-code-field";

const ConnectDeviceView = () => {
  const [value, setValue] = useState("");

  const renderCell = ({ index, symbol, isFocused }) => (
    <View key={index} style={[styles.cellRoot, isFocused && styles.focusCell]}>
      <Text style={styles.cellText}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text h1>Connect your bike</Text>
      <CodeField
        value={value}
        onChangeText={setValue}
        cellCount={6}
        textContentType="oneTimeCode"
        renderCell={renderCell}
        rootStyle={styles.codeFiledRoot}
      />
      <Button>CONNECT</Button>
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
    textTransform: "uppercase"
  },
  focusCell: {
    borderBottomColor: '#6562FF',
    borderBottomWidth: 1,
  },
});

export default ConnectDeviceView;

import { StyleSheet } from "react-native";
import { Button } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

const styles = StyleSheet.create({
    button: {
        alignSelf: "stretch",
        marginLeft: 12,
        marginRight: 12,
        marginTop: 12,
        borderRadius: 6,
    }
});

export default function ClearAsyncStorageButton() {
    const [isLoading, setLoading] = React.useState(false);

    const clearAsyncStorage = async () => {
        setLoading(true);
        AsyncStorage.clear();
        setLoading(false);
    }

    return (
        <Button 
        title="Clear storage" 
        containerStyle={styles.button}
        loading={isLoading}
        onPress={clearAsyncStorage} />
    )
}
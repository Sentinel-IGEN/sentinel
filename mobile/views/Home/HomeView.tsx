import React from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeView = () => {
  // user data
  const [userId, setUserId] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState(null);

  // for user data fetch (bc storage read/write is async)
  const [isLoading, setIsLoading] = React.useState(true);

  // fetch user data on initial render
  React.useEffect(() => {
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem("@userId");
      const phoneNumber = await AsyncStorage.getItem("@phoneNumber");

      setUserId(userId);
      setPhoneNumber(phoneNumber);

      setIsLoading(false);
    };
    fetchUserData();
  }, []);

  return (
    <View>
      <Text>Home view!!</Text>
      <Text>isLoading: {isLoading ? "true" : "false"}</Text>
      <Text>userId: {userId}</Text>
      <Text>phoneNumber: {phoneNumber}</Text>
    </View>
  );
};

export default HomeView;

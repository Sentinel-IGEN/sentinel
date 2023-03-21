import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getBikeLocationHistory } from "../../helpers/Requests";

const LocationHistory = () => {
  const [date, setDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [locationArray, setLocationArray] = useState([]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  useEffect(() => {
    console.log(locationArray);
  }, [locationArray]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getBikeLocationHistory();
      setLocationArray(locations);
    };

    fetchLocations();
  }, []);

  return (
    <View style={styles.viewRoot}>
      <View style={styles.header}>
        <Text style={{ fontSize: 18 }}>Viewing location on: </Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"date"}
          is24Hour={true}
          onChange={onChange}
          maximumDate={new Date(Date.now())}
          style={styles.dateTimePicker}
        />
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingLeft: 20,
  },
  dateTimePicker: {
    height: 40,
    width: 140,
  },
});

export default LocationHistory;

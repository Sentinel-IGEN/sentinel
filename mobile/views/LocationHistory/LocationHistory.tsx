import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Text } from "@rneui/themed";
import Map, { Polyline, Circle } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getBikeLocationHistory } from "../../helpers/Requests";

interface LocationDataPoint {
  time: number;
  latitude: number;
  longitude: number;
}

const LocationHistory = () => {
  const [date, setDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));

  const [locationArray, setLocationArray] = useState<Array<LocationDataPoint>>(
    []
  );
  const [filteredLocations, setFilteredLocations] = useState<
    Array<LocationDataPoint>
  >([]);

  const [region, setRegion] = useState({
    latitude: 49.26400057251193, // default for now
    longitude: -123.25015147397013, //default for now
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  // when selected date or location logs update, update filtered location logs and set new map area
  useEffect(() => {
    const filtered = locationArray
      .filter(
        (location) =>
          location.time &&
          location.time > date.valueOf() &&
          location.time < date.valueOf() + 86400000
      )
      .map((data) => ({
        ...data,
      }));

    if (filtered.length > 0) {
      setRegion({
        latitude: filtered[0].latitude,
        longitude: filtered[0].longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      });
    }

    setFilteredLocations(filtered);
  }, [locationArray, date]);

  // fetch location logs on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getBikeLocationHistory();
      setLocationArray(
        locations.map((data) => {
          return {
            time: data.time,
            latitude: Number(data.location.split(",")[0]),
            longitude: Number(data.location.split(",")[1]),
          };
        })
      );
    };

    fetchLocations();
  }, []);

  return (
    <View style={styles.viewRoot}>
      <View style={styles.header}>
        <Text style={{ fontSize: 18 }}>Viewing history on: </Text>
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
      <Map region={region} style={styles.map}>
        {filteredLocations.length > 0 && (
          <>
            <Polyline
              coordinates={filteredLocations}
              strokeWidth={2}
              strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={[
                "rgba(156, 128, 255, 1)",
                "rgba(156, 128, 255, 1)",
                "rgba(109, 69, 255, 1)",
                "rgba(56, 0, 255, 1)",
              ]}
            />
            <Circle
              center={filteredLocations[filteredLocations.length - 1]}
              radius={20}
              fillColor="rgba(56, 0, 255, 1)"
              strokeColor="rgba(56, 0, 255, 1)"
            />
          </>
        )}
      </Map>
      <View style={styles.logsContainer}>
        <Text h4>Bike Location Logs:</Text>
        <FlatList
          data={filteredLocations}
          style={styles.listStyle}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{new Date(item.time).toLocaleTimeString("en-US")}</Text>
              <Text>
                ({item.latitude.toFixed(2)}, {item.longitude.toFixed(2)})
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewRoot: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(250, 250, 250, 0.8)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "absolute",
    top: 30,
    elevation: 5,
  },
  dateTimePicker: {
    height: 40,
    width: 140,
  },
  map: {
    height: "60%",
    width: "100%",
    zIndex: -1,
  },
  logsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
    backgroundColor: "white",
  },
  listStyle: {
    marginTop: 12,
    borderTopColor: "rgba(170, 170, 170, 1)",
    borderTopWidth: 1,
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217, 217, 217, 1)",
  },
});

export default LocationHistory;

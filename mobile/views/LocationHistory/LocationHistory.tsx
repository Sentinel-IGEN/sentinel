import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { Text } from "@rneui/themed";
import Map, { Polyline, Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getBikeLocationHistory, LocationData } from "../../helpers/Requests";

const LocationHistory = () => {
  const addressLengthLimit = 35;

  const [date, setDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));

  const [locationArray, setLocationArray] = useState<Array<LocationData>>([]);
  const [filteredLocations, setFilteredLocations] = useState<
    Array<LocationData>
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
    const repeatAddresses = new Set();

    const filtered = locationArray.reverse().filter((location) => {
      if (repeatAddresses.has(location.address)) {
        return false;
      }
      repeatAddresses.add(location.address);

      return (
        location.time &&
        location.time > date.valueOf() &&
        location.time < date.valueOf() + 86400000
      );
    });

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
      setLocationArray(locations);
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
            <Marker
              coordinate={filteredLocations[filteredLocations.length - 1]}
              tappable={false}
            >
              <Image
                source={require("../../assets/bike.png")}
                style={{ height: 35, width: 35 }}
              />
            </Marker>
            <Polyline
              coordinates={filteredLocations}
              strokeWidth={4}
              strokeColor="rgba(76, 28, 173, 1)"
            />
          </>
        )}
      </Map>
      <View style={styles.logsContainer}>
        <Text style={styles.title}>Bike Location Logs</Text>
        <FlatList
          data={filteredLocations}
          style={styles.listStyle}
          ListEmptyComponent={() => (
            <Text style={{ ...styles.listItemText, ...styles.emptyText }}>
              No logs for {date.toDateString()}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>
                {item.address.length > addressLengthLimit
                  ? item.address.slice(0, addressLengthLimit - 3) + "..."
                  : item.address}
              </Text>
              <Text style={styles.listItemText}>
                {new Date(item.time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
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
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
    padding: 0,
    height: "100%",
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
  title: {
    fontSize: 22,
    fontWeight: "600",
    //alignSelf: "center",
    marginLeft: 8,
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
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "50%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 14,
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
    marginTop: 10,
    borderTopColor: "rgba(170, 170, 170, 1)",
    borderTopWidth: 1,
    marginBottom: 4,
    paddingTop: 8,
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  listItemText: {
    fontSize: 15,
  },
  emptyText: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});

export default LocationHistory;

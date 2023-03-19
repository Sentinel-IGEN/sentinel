import Map, { Circle, Marker } from "react-native-maps";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { useRecoilValue } from "recoil";
import { bikeGPSState } from "../../recoil_state";
import * as Location from "expo-location";

const MapView = (props) => {
  const [myLocation, setMyLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 49.26400057251193,
    longitude: -123.25015147397013,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
      }

      const currentPosition = await Location.getCurrentPositionAsync({});
      const location = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };
      setMyLocation(location);
      setRegion((region) => {
        return { ...region, ...location };
      });
    })();
  }, []);

  const BikeLocationMarker = () => {
    const bikeLocation = useRecoilValue(bikeGPSState);
    return (
      <>
        <Circle
          center={bikeLocation}
          radius={150}
          strokeWidth={2}
          fillColor="rgba(29, 0, 255, 0.09)"
          strokeColor="rgba(29, 0, 255, 0.47)"
        />
        <Marker
          coordinate={{
            latitude: bikeLocation.latitude,
            longitude: bikeLocation.longitude,
          }}
          tappable={false}
        >
          <Image
            source={require("../../assets/bike.png")}
            style={{ height: 35, width: 35 }}
          />
        </Marker>
      </>
    );
  };

  return (
    <Map region={region} {...props}>
      <BikeLocationMarker />
      {myLocation && (
        <Marker
          coordinate={{
            latitude: myLocation.latitude - 0.0002,
            longitude: myLocation.longitude,
          }}
          tappable={false}
        >
          <Image
            source={require("../../assets/pin.png")}
            style={{ height: 35, width: 35 }}
          />
        </Marker>
      )}
    </Map>
  );
};

export default MapView;

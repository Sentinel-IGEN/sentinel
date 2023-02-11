import Map, { Circle, Marker } from "react-native-maps";
import React, { useState } from "react";

const MapView = (props) => {
  // temp region for demo
  const [region, setRegion] = useState({
    latitude: 49.26400057251193,
    longitude: -123.25015147397013,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  // temp location for demo
  const [bikeLocation, setBikeLocation] = useState({
    latitude: 49.26400057251193,
    longitude: -123.25015147397013,
  });

  return (
    <Map region={region} onRegionChange={setRegion} {...props}>
      <Circle
        center={bikeLocation}
        radius={150}
        strokeWidth={2}
        fillColor="rgba(29, 0, 255, 0.09)"
        strokeColor="rgba(29, 0, 255, 0.47)"
      />
      {/* TEMP MARKER FOR DEMO */}
      <Marker
        coordinate={{
          latitude: bikeLocation.latitude - 0.0002,
          longitude: bikeLocation.longitude,
        }}
        tappable={false}
        opacity={0.8}
      />
    </Map>
  );
};

export default MapView;

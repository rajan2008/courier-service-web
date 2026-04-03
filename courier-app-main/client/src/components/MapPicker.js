import React, { useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px"
};

const center = {
  lat: 28.6139, // Delhi center
  lng: 77.2090
};

const MapPicker = ({ onSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvI-_2IkyeOtczrxmb7sSpE0h2aKBHOHg"
  });

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY_HERE`)
      .then(res => res.json())
      .then(data => {
        if (data.results.length > 0) {
          const fullAddress = data.results[0].formatted_address;
          const pinMatch = fullAddress.match(/\b\d{6}\b/);
          const pincode = pinMatch ? pinMatch[0] : "";

          onSelect({ address: fullAddress, pincode });
        }
      });
  }, [onSelect]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onClick={handleMapClick}
    >
      <Marker position={center} />
    </GoogleMap>
  );
};

export default MapPicker;

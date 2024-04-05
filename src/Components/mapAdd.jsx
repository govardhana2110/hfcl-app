import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import CustomSearch from './customSearch'; // Import the custom search component

const PlainMap = ({ location, onMapClick }) => {
  const [clickedCoordinates, setClickedCoordinates] = useState(null);

  const handleMapClick = (e) => {
    const clickedCoords = [e.latlng.lat, e.latlng.lng];
    setClickedCoordinates(clickedCoords);
    console.log(clickedCoords);
    // Call the callback function to pass the clicked coordinates to the parent component
    onMapClick(clickedCoords);
  };
  
  return (
      <MapContainer
      center={location}
      zoom={10}
      style={{ width: '60%', marginLeft: '4%', marginTop: '5%' }}
      >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <CustomSearch />
      <ClickHandler handleClick={handleMapClick} />
      </MapContainer>
  );
};

const ClickHandler = ({ handleClick }) => {
  const map = useMapEvents({
    click: (e) => {
      handleClick(e);
    },
  });

  return null;
};

export default PlainMap;

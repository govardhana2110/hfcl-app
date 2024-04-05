import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

const CustomSearch = () => {
  const map = useMap();
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo([parseFloat(lat), parseFloat(lon)], 13);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  return (
    <div className="custom-search-container"> {/* Add a CSS class */}
      <input
        type="text"
        placeholder="Enter location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default CustomSearch;

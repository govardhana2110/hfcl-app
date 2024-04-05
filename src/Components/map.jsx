import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from "react-leaflet-fullscreen";
import customMarkerIcon from '../Images/location.png';
import customMarkerIconYellow from '../Images/markeryellow.png';
import customMarkerIconRed from '../Images/markerred.png';
import '../css/map.css';


const OpenStreetMap = ({ clusters, listDevice }) => {
  const coordinate = {}
  const [jsonDataArray, setJsonDataArray] = useState([]);
  for(let i=0;i<listDevice.length;i++){
    var temp = []
    temp.push(listDevice[i])
    coordinate[listDevice[i].device_name] = temp
  }
 
  const customIcon = new L.Icon({
    iconUrl: customMarkerIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const customIconGreen = new L.Icon({
    iconUrl: customMarkerIconRed,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(4);

  const mapRef = useRef();

  
 
  const handleMarkerClick = (coordinates) => {
    const map = mapRef.current;
    map.flyTo(coordinates, 7);
  };

  // Custom hook to access the Leaflet map instance
  function MapEvents() {
    const map = useMap();

    useEffect(() => {
      map.on('zoomend', () => {
        setZoom(map.getZoom())
      });
    }, [map]);

    return null;
  }

  function generateRandomColors(n) {
    const colors = [];
  const hueIncrement = 360 / (n + 2); // Add 2 to exclude red and green
  
  for (let i = 0; i < n; i++) {
    const hue = hueIncrement * (i + 1); // Start from the second hue value
    const color = `hsl(${hue}, 100%, 50%)`;
    colors.push(color);
  }
    
    return colors;
  }

  function generateLowContrastColor() {
    // Generate random values for RGB components
    const r = Math.floor(Math.random() * 150); 
    const g = Math.floor(Math.random() * 150);
    const b = Math.floor(Math.random() * 150); 
    const hexColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hexColor;
}

  function groupByCluster(array) {
    return array.reduce((acc, obj) => {
        const cluster = obj.cluster_name;
        if (!acc[cluster]) {
            acc[cluster] = [];
        }
        acc[cluster].push(obj);
        return acc;
    }, {});
}

  const deviceList = Object.values(groupByCluster(listDevice));

  function getCircleValues(data) {
    // Ensure data is an array and not empty
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    const uniqueCircles = [];
    const seenCircles = new Set();

    data.forEach(item => {
      if (item.circle !== undefined && !seenCircles.has(item.circle)) {
        uniqueCircles.push(item.circle);
        seenCircles.add(item.circle);
      }
    });
  
    return uniqueCircles;
}

  const circles = getCircleValues(listDevice);
  const colors = generateRandomColors(deviceList.length)

  useEffect(() => {
    async function importJson(fileName) {
      try {
        const data = await import(`../IndianStatesGeoJson/${fileName}.json`);
        setJsonDataArray(prevData => [...prevData, data.default]); // Accessing the default export
      } catch (error) {
        console.error("Error importing JSON file:", error);
      }
    }

    // Import JSON files for each file name in the array
    circles.forEach(fileName => {
      importJson(fileName);
    });
  }, []);



  const MapMarkers = ({ color,markerList }) => {
    return (
      markerList.map((marker, index) => (
        <Marker
            key={index}
            icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div><svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C7.589 0 4 3.589 4 8c0 4.824 7.028 14.402 7.464 14.953a.706.706 0 0 0 .072.1.838.838 0 0 0 .143.172l.001.001c.04.038.083.069.129.093.046.024.097.041.151.05.055.008.11.009.165 0 .054-.009.105-.026.15-.051a.785.785 0 0 0 .13-.093l.001-.001c.045-.043.087-.098.126-.159a.706.706 0 0 0 .071-.1C12.971 22.402 20 12.824 20 8c0-4.411-3.589-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                  fill=${marker.ConnectionStatus?`"${color}"`:"red"}
                />
              </svg></div>`,
            })}
            position={marker.coordinates}
            eventHandlers={{
                click: () => handleMarkerClick(marker.coordinates),
            }}
        >
            <Tooltip>
                <div style={{ textTransform: 'capitalize' }}>
                    <div style={{ fontWeight: '700' }}>{marker.location} {zoom < 8 ? ('Cluster') : ('')}</div>
                    {marker && (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex' }}>
                                Connection Status: {marker.ConnectionStatus ? (
                                <span>
                                    <div style={{ display: 'flex' }}>
                                        <div className='blinking-circle-green' style={{ marginTop: '8%', marginLeft: '8%', height: '9px', width: '13px' }}></div>
                                        <div style={{ marginLeft: '5px', color: 'green' }}>Active</div>
                                    </div>
                                </span>
                                ) : (
                                <span>
                                    <div style={{ display: 'flex' }}>
                                        <div className='blinking-circle-red1' style={{ marginTop: '8%', marginLeft: '8%', height: '9px', width: '13px' }}></div>
                                        <div style={{ marginLeft: '5px', color: 'red' }}>Inactive</div>
                                    </div>
                                </span>
                                )}
                            </div>
                            <div>
                                Clusters: <span>{marker.cluster_name}</span>
                            </div>
                            <div>
                                Site: <span>{marker.site_name}</span>
                            </div>
                            <div>
                                Device Type: <span>{marker.device_type}</span>
                            </div>
                            <div>
                                IP Address: <span>{marker.ip_add}</span>
                            </div>
                            <div>
                                Unique ID: <span>{marker.unique_id}</span>
                            </div>
                            <div>
                                Unique: <span>{marker.ConnectionStatus.toString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Tooltip>
        </Marker>
    ))
    )
    
};

  return (
 
<MapContainer
  ref={mapRef}
  center={center}
  zoom={zoom}
  style={{ height: '360px', width: '100%' }}
  preferCanvas={true} 
  zoomControl={true}
  attributionControl={true} 
  fullscreenControl={true}
  whenCreated={map => {
    map.getContainer().querySelector(".leaflet-control-geocoder-form").setAttribute("lang", "en");
  }}
>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents /> 
      {deviceList.map((i,index)=><MapMarkers color={colors[index]} markerList={i} key ={index}/>)}
      {jsonDataArray.map((i,index)=><GeoJSON data={i} style={{ fillColor: colors[index], weight:0.5, opacity: 0.5, color:colors[index], fillOpacity: 0.3 }} />
)}   
    </MapContainer>
  );
};

export default OpenStreetMap;
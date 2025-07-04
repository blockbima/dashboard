"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

interface Contract {
  region: { name: string };
  beneficiaries: string[];
}

const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  Marikiti: { lat: -1.2921, lng: 36.8219 },
  Nyeri: { lat: -0.4371, lng: 36.9580 },
  Kitengela: { lat: -1.5167, lng: 36.85 },
};

export default function MapPreview({ contracts }: { contracts: Contract[] }) {
  // Aggregate beneficiaries per region
  const regionMap: Record<string, { coords: { lat: number; lng: number }; count: number }> = {};
  contracts.forEach((c) => {
    const name = c.region.name;
    const coords = regionCoordinates[name];
    if (!coords) return;
    if (!regionMap[name]) {
      regionMap[name] = { coords, count: c.beneficiaries.length };
    } else {
      regionMap[name].count += c.beneficiaries.length;
    }
  });

  const regions = Object.values(regionMap);
  const center = regions.length
    ? [regions[0].coords.lat, regions[0].coords.lng]
    : [-1.2921, 36.8219];

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={7}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup>
        {regions.map(({ coords, count }, idx) => (
          <Marker key={idx} position={[coords.lat, coords.lng]}>
            <Popup>{count} beneficiaries</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

// components/MapPreview.tsx
"use client";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
  const regionMap: Record<string, { coords: { lat: number; lng: number }; count: number }> = {};
  contracts.forEach((c) => {
    const name = c.region.name;
    const coords = regionCoordinates[name];
    if (!coords) return;
    if (!regionMap[name]) regionMap[name] = { coords, count: 0 };
    regionMap[name].count += c.beneficiaries.length;
  });

  const regions = Object.values(regionMap);
  const center: [number, number] = regions.length
    ? [regions[0].coords.lat, regions[0].coords.lng]
    : [-1.2921, 36.8219];

  return (
    <MapContainer center={center} zoom={7} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {regions.map(({ coords, count }) => (
        <Marker key={`${coords.lat}-${coords.lng}`} position={[coords.lat, coords.lng]}>
          <Popup>{count} beneficiaries</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

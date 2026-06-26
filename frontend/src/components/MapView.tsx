import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Location } from '../types';
import { formatLocationName, formatMapPinLabel } from './format';

interface MapViewProps {
  className?: string;
  locations: Location[];
  selectedId: number | null;
  interactive?: boolean;
  onSelectLocation?: (id: number) => void;
}

const SINGAPORE_CENTER: LatLngExpression = [1.3521, 103.8198];

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function MapBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    window.requestAnimationFrame(() => map.invalidateSize());

    if (locations.length === 0) {
      map.setView(SINGAPORE_CENTER, 11);
      return;
    }

    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 11);
      return;
    }

    const bounds = L.latLngBounds(locations.map((location) => [location.latitude, location.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [locations, map]);

  return null;
}

function createPinIcon(location: Location, isSelected: boolean) {
  const label = formatMapPinLabel(location.weather.condition, location.weather.temperature_c);
  const name = formatLocationName(location.weather.area, location.latitude, location.longitude);
  const selectedClass = isSelected ? ' weather-map-pin--selected' : '';

  return L.divIcon({
    className: 'weather-map-marker',
    html: `
      <div class="weather-map-pin${selectedClass}">
        <div class="weather-map-pin__label">${escapeHtml(label)}</div>
        <div class="weather-map-pin__name">${escapeHtml(name)}</div>
        <div class="weather-map-pin__stem"></div>
        <div class="weather-map-pin__dot"></div>
      </div>
    `,
    iconSize: [132, 76],
    iconAnchor: [66, 68],
  });
}

export function MapView({
  className = '',
  locations,
  selectedId,
  interactive = true,
  onSelectLocation,
}: MapViewProps) {
  const pins = useMemo(
    () =>
      locations.map((location) => ({
        location,
        icon: createPinIcon(location, location.id === selectedId),
      })),
    [locations, selectedId],
  );

  return (
    <div className={`overflow-hidden rounded-[1.75rem] ${className}`}>
      <MapContainer
        center={SINGAPORE_CENTER}
        zoom={11}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        attributionControl={interactive}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds locations={locations} />
        {pins.map(({ location, icon }) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={icon}
            eventHandlers={
              onSelectLocation
                ? {
                    click: () => onSelectLocation(location.id),
                  }
                : undefined
            }
          />
        ))}
      </MapContainer>
    </div>
  );
}

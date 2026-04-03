import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useBirdStore } from '../stores/useBirdStore';
import { useMapStore } from '../stores/useMapStore';
import { AUSTRALIA_CENTER, DEFAULT_ZOOM, REGION_NAMES } from '../lib/constants';
import type { AustralianRegionId } from '../types/bird';

// Fix default marker icon issue with webpack/vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface GeoJsonFeature {
  type: string;
  properties: {
    id: AustralianRegionId;
    name: string;
    speciesCount: number;
  };
  geometry: unknown;
}

function getColor(speciesCount: number): string {
  if (speciesCount > 40) return '#1B3D1B';
  if (speciesCount > 30) return '#245024';
  if (speciesCount > 20) return '#2D5F2D';
  if (speciesCount > 10) return '#4A7A4A';
  return '#8BC48B';
}

export default function MapPage() {
  const birds = useBirdStore((s) => s.birds);
  const { selectedRegion, selectRegion } = useMapStore();
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/regions.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch(() => {
        // GeoJSON not available
      });
  }, []);

  const selectedRegionInfo = selectedRegion
    ? {
        name: REGION_NAMES[selectedRegion],
        birdCount: birds.filter((b) => b.regions.includes(selectedRegion)).length,
      }
    : null;

  const onEachFeature = (feature: GeoJsonFeature, layer: L.Layer) => {
    layer.on({
      click: () => {
        selectRegion(feature.properties.id);
      },
    });
  };

  const geoStyle = (feature?: GeoJsonFeature) => ({
    fillColor: feature ? getColor(feature.properties.speciesCount) : '#ccc',
    weight: 2,
    opacity: 1,
    color: '#FAF8F4',
    fillOpacity: 0.7,
  });

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[AUSTRALIA_CENTER.lat, AUSTRALIA_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='Map data &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <GeoJSON
              data={geoData}
              style={geoStyle as L.StyleFunction}
              onEachFeature={onEachFeature as L.GeoJSONOptions['onEachFeature']}
            />
          )}
          {birds.map((bird) => (
            <Marker
              key={bird.id}
              position={[bird.coordinates.lat, bird.coordinates.lng]}
            >
              <Popup>
                <div className="text-center">
                  <img
                    src={bird.imageUrl}
                    alt={bird.commonName}
                    className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                  />
                  <p className="font-semibold">{bird.commonName}</p>
                  <Link
                    to={`/species/${bird.id}`}
                    className="text-xs text-eucalyptus-500 hover:underline"
                  >
                    View details &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <aside className="w-full border-l border-sand-300 bg-white p-6 lg:w-80 overflow-y-auto">
        <h2 className="font-serif text-xl font-bold text-bark-900 mb-4">
          Region Explorer
        </h2>
        {selectedRegionInfo ? (
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-eucalyptus-500">
              {selectedRegionInfo.name}
            </h3>
            <p className="text-sm text-bark-700">
              <span className="font-semibold">{selectedRegionInfo.birdCount}</span>{' '}
              species found in this region
            </p>
            <div className="space-y-2">
              {birds
                .filter((b) => b.regions.includes(selectedRegion!))
                .slice(0, 10)
                .map((b) => (
                  <Link
                    key={b.id}
                    to={`/species/${b.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-sand-100 transition-colors"
                  >
                    <img
                      src={b.imageUrl}
                      alt={b.commonName}
                      className="h-8 w-8 rounded-full object-cover bg-sand-200"
                    />
                    <span className="text-sm font-medium text-bark-900">
                      {b.commonName}
                    </span>
                  </Link>
                ))}
            </div>
            <button
              onClick={() => selectRegion(null)}
              className="text-xs text-bark-400 hover:text-bark-700"
            >
              Clear selection
            </button>
          </div>
        ) : (
          <p className="text-sm text-bark-400">
            Click a region on the map to see the birds found there.
          </p>
        )}
      </aside>
    </div>
  );
}

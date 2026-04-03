import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useBirdStore } from '../stores/useBirdStore';
import ConservationBadge from '../components/birds/ConservationBadge';
import HabitatTag from '../components/birds/HabitatTag';
import BirdCard from '../components/birds/BirdCard';

type Tab = 'overview' | 'distribution' | 'population';

export default function SpeciesPage() {
  const { slug } = useParams<{ slug: string }>();
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const allBirds = useBirdStore((s) => s.birds);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const bird = slug ? getBirdBySlug(slug) : undefined;

  const relatedBirds = useMemo(() => {
    if (!bird) return [];
    return allBirds
      .filter((b) => b.id !== bird.id && b.category === bird.category)
      .slice(0, 4);
  }, [bird, allBirds]);

  // Generate a simple population trend line from current data
  const populationData = useMemo(() => {
    if (!bird) return [];
    const current = bird.population.current;
    const year = bird.population.lastSurveyYear;
    const trendMultiplier =
      bird.population.trend === 'increasing'
        ? 0.05
        : bird.population.trend === 'decreasing'
          ? -0.05
          : 0;

    return Array.from({ length: 6 }, (_, i) => {
      const y = year - 5 + i;
      const factor = 1 + trendMultiplier * (i - 5);
      return {
        year: y,
        population: Math.round(current * factor),
      };
    });
  }, [bird]);

  if (!bird) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-4xl font-bold text-bark-900">404</h1>
        <p className="mt-2 text-bark-400">Bird species not found</p>
        <Link
          to="/catalog"
          className="mt-6 rounded-lg bg-eucalyptus-500 px-6 py-2 text-sm font-medium text-white hover:bg-eucalyptus-600"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'distribution', label: 'Distribution' },
    { key: 'population', label: 'Population' },
  ];

  return (
    <div className="pb-16">
      {/* Hero image */}
      <div className="relative h-64 bg-sand-200 md:h-96">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bark-900/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <Link
            to="/catalog"
            className="mb-3 inline-flex items-center gap-1 text-sm text-sand-200 hover:text-white"
          >
            &larr; Back to Catalog
          </Link>
          <motion.h1
            className="font-serif text-3xl font-bold text-white md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {bird.commonName}
          </motion.h1>
          <p className="mt-1 text-sm italic text-sand-200">{bird.scientificName}</p>
          <div className="mt-3">
            <ConservationBadge status={bird.conservationStatus} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        {/* Tabs */}
        <div className="flex border-b border-sand-300 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-eucalyptus-500 text-eucalyptus-500'
                  : 'text-bark-400 hover:text-bark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <h2 className="font-serif text-xl font-bold text-bark-900 mb-2">
                About
              </h2>
              <p className="text-bark-700 leading-relaxed">{bird.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-sand-100 p-4">
                <h3 className="text-xs font-semibold uppercase text-bark-400">Diet</h3>
                <p className="mt-1 text-sm text-bark-900">{bird.diet}</p>
              </div>
              <div className="rounded-lg bg-sand-100 p-4">
                <h3 className="text-xs font-semibold uppercase text-bark-400">Size</h3>
                <p className="mt-1 text-sm text-bark-900">
                  {bird.size.lengthCm} cm
                  {bird.size.wingspanCm ? ` | Wingspan: ${bird.size.wingspanCm} cm` : ''}
                  {bird.size.weightG ? ` | ${bird.size.weightG} g` : ''}
                </p>
              </div>
              <div className="rounded-lg bg-sand-100 p-4">
                <h3 className="text-xs font-semibold uppercase text-bark-400">
                  Family
                </h3>
                <p className="mt-1 text-sm text-bark-900">{bird.family}</p>
              </div>
            </div>

            <div className="rounded-lg border border-ochre-400 bg-ochre-400/10 p-4">
              <h3 className="text-sm font-semibold text-ochre-600">Fun Fact</h3>
              <p className="mt-1 text-sm text-bark-700">{bird.funFact}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-bark-900 mb-2">Habitats</h3>
              <div className="flex flex-wrap gap-2">
                {bird.habitats.map((h) => (
                  <HabitatTag key={h} habitat={h} />
                ))}
              </div>
            </div>

            {bird.imageCredit && (
              <p className="text-xs text-bark-400">
                Photo credit: {bird.imageCredit}
              </p>
            )}
          </motion.div>
        )}

        {activeTab === 'distribution' && (
          <motion.div
            className="h-96 rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapContainer
              center={[bird.coordinates.lat, bird.coordinates.lng]}
              zoom={6}
              className="h-full w-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[bird.coordinates.lat, bird.coordinates.lng]}>
                <Popup>{bird.commonName}</Popup>
              </Marker>
            </MapContainer>
          </motion.div>
        )}

        {activeTab === 'population' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-baseline gap-4">
              <p className="text-sm text-bark-700">
                Estimated population:{' '}
                <span className="font-bold text-bark-900">
                  {bird.population.current.toLocaleString()}
                </span>
              </p>
              <span
                className={`text-xs font-medium ${
                  bird.population.trend === 'increasing'
                    ? 'text-status-least'
                    : bird.population.trend === 'decreasing'
                      ? 'text-status-critical'
                      : 'text-bark-400'
                }`}
              >
                Trend: {bird.population.trend}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={populationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="population"
                    stroke="#2D5F2D"
                    strokeWidth={2}
                    dot={{ fill: '#2D5F2D' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Related birds */}
        {relatedBirds.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-bark-900 mb-6">
              Related Species
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedBirds.map((b) => (
                <BirdCard key={b.id} bird={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useBirds } from "../../hooks/useBirds";
import { useFilterStore } from "../../stores/useFilterStore";
import { HABITAT_LABELS, CONSERVATION_LABELS } from "../../lib/constants";
import type {
  BirdSpecies,
  HabitatType,
  ConservationStatus,
} from "../../types/bird";
import BirdCard from "./BirdCard";
import BirdDetail from "./BirdDetail";

export default function CollectionGrid() {
  const birds = useBirds();
  const {
    filters,
    setSearchQuery,
    toggleHabitat,
    toggleConservationStatus,
    clearAllFilters,
  } = useFilterStore();
  const [selectedBird, setSelectedBird] = useState<BirdSpecies | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      const timeout = setTimeout(() => setSearchQuery(value), 300);
      return () => clearTimeout(timeout);
    },
    [setSearchQuery],
  );

  const habitatOptions = useMemo(
    () => Object.entries(HABITAT_LABELS) as [HabitatType, string][],
    [],
  );
  const statusOptions = useMemo(
    () => Object.entries(CONSERVATION_LABELS) as [ConservationStatus, string][],
    [],
  );

  return (
    <section
      className="min-h-screen overflow-hidden bg-sand-100 px-6 py-24"
      aria-label="Bird collection"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl font-bold text-bark-900 md:text-5xl">
            The Collection
          </h2>
          <p className="mt-2 text-bark-400">All 40 species at a glance</p>
        </motion.div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-bark-900 placeholder-bark-400 outline-none focus:border-eucalyptus-500 focus:ring-2 focus:ring-eucalyptus-500/20"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {habitatOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleHabitat(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.habitats.includes(key)
                  ? "bg-eucalyptus-500 text-white"
                  : "bg-sand-200 text-bark-700 hover:bg-sand-300"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="mx-1 w-px bg-sand-300" />
          {statusOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleConservationStatus(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.conservationStatuses.includes(key)
                  ? "bg-eucalyptus-500 text-white"
                  : "bg-sand-200 text-bark-700 hover:bg-sand-300"
              }`}
            >
              {label}
            </button>
          ))}
          {(filters.habitats.length > 0 ||
            filters.conservationStatuses.length > 0 ||
            filters.searchQuery) && (
            <button
              onClick={() => {
                clearAllFilters();
                setSearchInput("");
              }}
              className="rounded-full bg-outback-red px-3 py-1 text-xs font-medium text-white"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {birds.map((bird) => (
            <BirdCard key={bird.id} bird={bird} onSelect={setSelectedBird} />
          ))}
        </div>

        {birds.length === 0 && (
          <p className="mt-12 text-center text-bark-400">
            No birds match your filters.
          </p>
        )}
      </div>

      <BirdDetail bird={selectedBird} onClose={() => setSelectedBird(null)} />
    </section>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFilterStore } from '../../stores/useFilterStore';
import { REGION_NAMES, HABITAT_LABELS, CONSERVATION_LABELS, CONSERVATION_COLORS } from '../../lib/constants';
import type { AustralianRegionId, HabitatType, ConservationStatus } from '../../types/bird';

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-sand-300 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-bark-900"
      >
        {title}
        <span className="text-bark-400">{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && <div className="mt-1 space-y-1.5">{children}</div>}
    </div>
  );
}

export default function FilterPanel() {
  const {
    filters,
    setSearchQuery,
    toggleRegion,
    toggleHabitat,
    toggleConservationStatus,
    setSortBy,
    clearAllFilters,
  } = useFilterStore();

  const [localQuery, setLocalQuery] = useState(filters.searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleQueryChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(value);
      }, 300);
    },
    [setSearchQuery],
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Sync local state when filters are cleared externally
  useEffect(() => {
    setLocalQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  const count = useFilterStore.getState().activeFilterCount();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search birds..."
          className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-bark-900 placeholder:text-bark-400 focus:border-eucalyptus-500 focus:outline-none focus:ring-1 focus:ring-eucalyptus-500"
        />
      </div>

      {/* Clear all */}
      {count > 0 && (
        <button
          onClick={clearAllFilters}
          className="text-xs font-medium text-eucalyptus-500 hover:underline"
        >
          Clear all filters ({count})
        </button>
      )}

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-bark-700 mb-1">Sort by</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'population')}
          className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-bark-900 focus:border-eucalyptus-500 focus:outline-none"
        >
          <option value="name">Name</option>
          <option value="status">Conservation Status</option>
          <option value="population">Population</option>
        </select>
      </div>

      {/* Region filter */}
      <CollapsibleSection title="Region">
        {(Object.keys(REGION_NAMES) as AustralianRegionId[]).map((region) => (
          <label key={region} className="flex items-center gap-2 text-sm text-bark-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.regions.includes(region)}
              onChange={() => toggleRegion(region)}
              className="rounded border-sand-300 text-eucalyptus-500 focus:ring-eucalyptus-500"
            />
            {REGION_NAMES[region]}
          </label>
        ))}
      </CollapsibleSection>

      {/* Habitat filter */}
      <CollapsibleSection title="Habitat">
        {(Object.keys(HABITAT_LABELS) as HabitatType[]).map((habitat) => (
          <label key={habitat} className="flex items-center gap-2 text-sm text-bark-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.habitats.includes(habitat)}
              onChange={() => toggleHabitat(habitat)}
              className="rounded border-sand-300 text-eucalyptus-500 focus:ring-eucalyptus-500"
            />
            {HABITAT_LABELS[habitat]}
          </label>
        ))}
      </CollapsibleSection>

      {/* Conservation status filter */}
      <CollapsibleSection title="Conservation Status">
        {(Object.keys(CONSERVATION_LABELS) as ConservationStatus[]).map((status) => (
          <label key={status} className="flex items-center gap-2 text-sm text-bark-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.conservationStatuses.includes(status)}
              onChange={() => toggleConservationStatus(status)}
              className="rounded border-sand-300 text-eucalyptus-500 focus:ring-eucalyptus-500"
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CONSERVATION_COLORS[status] }}
            />
            {CONSERVATION_LABELS[status]}
          </label>
        ))}
      </CollapsibleSection>
    </div>
  );
}

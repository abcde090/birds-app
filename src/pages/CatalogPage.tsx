import { useState } from 'react';
import { useBirdStore } from '../stores/useBirdStore';
import { useBirds } from '../hooks/useBirds';
import FilterPanel from '../components/filters/FilterPanel';
import BirdGrid from '../components/birds/BirdGrid';

export default function CatalogPage() {
  const allBirds = useBirdStore((s) => s.birds);
  const filteredBirds = useBirds();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-bark-900">Bird Catalog</h1>
        <p className="mt-1 text-sm text-bark-400">
          Showing {filteredBirds.length} of {allBirds.length} species
        </p>
      </div>

      {/* Mobile filter toggle */}
      <button
        className="mb-4 rounded-lg bg-eucalyptus-500 px-4 py-2 text-sm font-medium text-white lg:hidden"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        {filtersOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="flex gap-8">
        {/* Sidebar filters - desktop always visible, mobile collapsible */}
        <aside
          className={`w-full shrink-0 lg:block lg:w-64 ${
            filtersOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <FilterPanel />
          </div>
        </aside>

        {/* Bird grid */}
        <div className="min-w-0 flex-1">
          <BirdGrid birds={filteredBirds} />
        </div>
      </div>
    </div>
  );
}

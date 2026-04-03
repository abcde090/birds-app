import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useBirdStore } from './stores/useBirdStore';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage'));
const SpeciesPage = React.lazy(() => import('./pages/SpeciesPage'));

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-eucalyptus-500 border-t-transparent" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/species/:slug" element={<SpeciesPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;

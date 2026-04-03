import { useEffect } from "react";
import { useBirdStore } from "./stores/useBirdStore";
import ScrollProgress from "./components/scroll/ScrollProgress";
import HeroSection from "./components/scroll/HeroSection";
import DawnTransition from "./components/scroll/DawnTransition";
import BiomeChapter from "./components/scroll/BiomeChapter";
import ConservationSpotlight from "./components/scroll/ConservationSpotlight";
import CollectionGrid from "./components/scroll/CollectionGrid";
import ClosingSection from "./components/scroll/ClosingSection";
import { BIOME_CONFIGS } from "./lib/biomes";

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);
  const isLoading = useBirdStore((s) => s.isLoading);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outback-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ScrollProgress />
      <main>
        <HeroSection />
        <DawnTransition />
        {BIOME_CONFIGS.map((config) => (
          <BiomeChapter key={config.id} config={config} />
        ))}
        <ConservationSpotlight />
        <CollectionGrid />
        <ClosingSection />
      </main>
    </>
  );
}

export default App;

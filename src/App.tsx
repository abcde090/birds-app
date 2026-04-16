import { useEffect, useCallback, useState } from "react";
import { useBirdStore } from "./stores/useBirdStore";
import { useStationStore } from "./stores/useStationStore";
import { useVisitorStore } from "./stores/useVisitorStore";
import { useStationLoop } from "./hooks/useStationLoop";
import StationTitle from "./components/station/StationTitle";
import StationCanvas from "./components/station/StationCanvas";
import Toolbar from "./components/station/Toolbar";
import TimeControl from "./components/station/TimeControl";
import VisitorList from "./components/station/VisitorList";
import BirdInfoCard from "./components/station/BirdInfoCard";
import SessionSummary from "./components/station/SessionSummary";

function StationPlayingScreen() {
  useStationLoop();
  const newDiscoveries = useVisitorStore((s) => s.newDiscoveries);
  const [showInfoCard, setShowInfoCard] = useState<string | null>(null);
  const [shownCards, setShownCards] = useState<readonly string[]>([]);

  useEffect(() => {
    const unshown = newDiscoveries.find((id) => !shownCards.includes(id));
    if (unshown) {
      setShowInfoCard(unshown);
    }
  }, [newDiscoveries, shownCards]);

  const handleDismissCard = useCallback(() => {
    if (showInfoCard) {
      setShownCards((prev) => [...prev, showInfoCard]);
    }
    setShowInfoCard(null);
  }, [showInfoCard]);

  return (
    <div className="flex min-h-screen flex-col gap-2 bg-night-sky p-2 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <TimeControl />
        <StationCanvas />
      </div>
      <div className="flex w-full flex-col gap-2 md:w-64">
        <Toolbar />
        <VisitorList />
      </div>
      {showInfoCard && (
        <BirdInfoCard birdId={showInfoCard} onDismiss={handleDismissCard} />
      )}
    </div>
  );
}

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);
  const isLoading = useBirdStore((s) => s.isLoading);
  const stationScreen = useStationStore((s) => s.screen);
  const fetchBehaviors = useVisitorStore((s) => s.fetchBehaviors);

  useEffect(() => {
    fetchBirds();
    fetchBehaviors();
  }, [fetchBirds, fetchBehaviors]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <p className="text-lg text-outback-gold">Loading...</p>
      </div>
    );
  }

  switch (stationScreen) {
    case "station-title":
      return <StationTitle />;
    case "station-playing":
      return <StationPlayingScreen />;
    case "station-summary":
      return <SessionSummary />;
    default:
      return <StationTitle />;
  }
}

export default App;

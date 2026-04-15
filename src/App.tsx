import { useEffect, useCallback, useState } from "react";
import { useBirdStore } from "./stores/useBirdStore";
import { useGameStore } from "./stores/useGameStore";
import { useStationStore } from "./stores/useStationStore";
import { useVisitorStore } from "./stores/useVisitorStore";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { useStationLoop } from "./hooks/useStationLoop";
import TitleScreen from "./components/game/TitleScreen";
import GameScreen from "./components/game/GameScreen";
import ResultsScreen from "./components/game/ResultsScreen";
import FieldGuide from "./components/game/FieldGuide";
import StationTitle from "./components/station/StationTitle";
import StationCanvas from "./components/station/StationCanvas";
import Toolbar from "./components/station/Toolbar";
import TimeControl from "./components/station/TimeControl";
import VisitorList from "./components/station/VisitorList";
import BirdInfoCard from "./components/station/BirdInfoCard";
import SessionSummary from "./components/station/SessionSummary";

type AppMode = "catcher" | "station";

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
  const birds = useBirdStore((s) => s.birds);
  const isLoading = useBirdStore((s) => s.isLoading);
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const startNewRound = useGameStore((s) => s.startNewRound);

  const stationScreen = useStationStore((s) => s.screen);
  const fetchBehaviors = useVisitorStore((s) => s.fetchBehaviors);

  const { loaded: imagesLoaded } = useImagePreloader(birds);

  const [mode, setMode] = useState<AppMode>("station");

  useEffect(() => {
    fetchBirds();
    fetchBehaviors();
  }, [fetchBirds, fetchBehaviors]);

  const handlePlayCatcher = useCallback(() => {
    setMode("catcher");
    startNewRound();
  }, [startNewRound]);

  const handleFieldGuide = useCallback(() => {
    setMode("catcher");
    setScreen("field-guide");
  }, [setScreen]);

  const handleBackToTitle = useCallback(() => {
    setMode("catcher");
    setScreen("title");
  }, [setScreen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outback-gold border-t-transparent" />
      </div>
    );
  }

  // Station mode
  if (mode === "station") {
    switch (stationScreen) {
      case "station-title":
        return <StationTitle onPlayCatcher={handlePlayCatcher} />;
      case "station-playing":
        return <StationPlayingScreen />;
      case "station-summary":
        return <SessionSummary />;
      default:
        return <StationTitle onPlayCatcher={handlePlayCatcher} />;
    }
  }

  // Catcher mode
  switch (screen) {
    case "title":
      return (
        <TitleScreen
          onPlay={handlePlayCatcher}
          onFieldGuide={handleFieldGuide}
          imagesLoaded={imagesLoaded}
        />
      );
    case "playing":
    case "card-reveal":
      return <GameScreen />;
    case "results":
      return (
        <ResultsScreen
          onPlayAgain={handlePlayCatcher}
          onFieldGuide={handleFieldGuide}
        />
      );
    case "field-guide":
      return <FieldGuide onBack={handleBackToTitle} />;
    default:
      return null;
  }
}

export default App;

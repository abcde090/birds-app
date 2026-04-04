import { useEffect } from "react";
import { useBirdStore } from "./stores/useBirdStore";

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  return (
    <div className="min-h-screen bg-night-sky">
      {/* Bird Catcher game screens will go here */}
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import { useBirdStore } from './stores/useBirdStore';

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Scroll experience sections will go here */}
    </div>
  );
}

export default App;

import { useState } from 'react';
import { uploadAndRunTour } from '../api/tourService';
import ResultCard from '../components/ResultCard';

export default function Home() {
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    const data = {
      Destinations: ["A","B","C","D","E"],
      CostMatrix: [
        [0, 27, 41, 36, 14],
        [27, 0, 34, 22, 18],
        [41, 34, 0, 13, 25],
        [36, 22, 13, 0, 30],
        [14, 18, 25, 30, 0]
      ]
    };
    const res = await uploadAndRunTour(data);
    setResult(res.result);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tour Optimizer</h1>
      <button
        onClick={handleRun}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Run Optimization
      </button>

      {result && <ResultCard result={result} />}
    </div>
  );
}

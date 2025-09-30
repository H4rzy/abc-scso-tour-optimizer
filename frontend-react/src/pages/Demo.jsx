import { useState } from "react";
import { uploadAndRunTour } from "../api/tourService";
import ResultCard from "../components/ResultCard";

export default function Demo() {
  const [numPoints, setNumPoints] = useState(5);
  const [result, setResult] = useState(null);

  const generateData = (n) => {
    const Destinations = Array.from({ length: n }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    const CostMatrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 0)
    );
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const cost = Math.floor(Math.random() * 50) + 10;
        CostMatrix[i][j] = cost;
        CostMatrix[j][i] = cost;
      }
    }
    return { Destinations, CostMatrix };
  };

  const handleRun = async () => {
    const data = generateData(numPoints);
    try {
      const res = await uploadAndRunTour(data);
      setResult(res.result);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gọi API optimize!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Demo Hybrid ABC-SCSO</h2>
      <input
        type="number"
        min="2"
        max="26"
        value={numPoints}
        onChange={(e) => setNumPoints(Number(e.target.value))}
        className="border p-1 ml-2"
      />
      <button
        onClick={handleRun}
        className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Run
      </button>

      <ResultCard result={result} />
    </div>
  );
}

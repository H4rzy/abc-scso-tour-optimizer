export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-2">{result.algorithm}</h2>
      <p><strong>Population:</strong> {result.population}</p>
      <p><strong>Iterations:</strong> {result.iterations}</p>
      <p><strong>Best Cost:</strong> {result.bestCost}</p>

      <h3 className="font-semibold mt-4">Best Route:</h3>
      <p>{result.bestRouteName.join(" → ")}</p>
    </div>
  );
}

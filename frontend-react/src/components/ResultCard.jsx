export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="p-4 border rounded shadow bg-white mt-4">
      <h2 className="font-bold text-xl mb-2">{result.algorithm}</h2>
      <p><strong>Population:</strong> {result.population}</p>
      <p><strong>Iterations:</strong> {result.iterations}</p>
      <p><strong>Best Cost:</strong> {result.bestCost}</p>
      <p className="mt-2"><strong>Best Route:</strong></p>
      <p className="text-blue-700">{result.bestRouteName.join(" → ")}</p>
    </div>
  );
}

import { useState } from "react";

interface Result {
  score: number;
  issues: { id: string; message: string; impact: string }[];
  suggestions: { [key: string]: string };
}

function App() {
  const [url, setUrl] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [results, setResults] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("https://accessibility-analyzer-production.up.railway.app/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: inputValue }),
});


      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "Failed to analyze URL");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">♿ Accessibility Analyzer</h1>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setUrl(e.target.value);
            }}
            placeholder="Enter URL to analyze (e.g., https://example.com)"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </form>

        {error && <p className="text-red-600 font-semibold text-center">{error}</p>}

        {results && (
          <div className="mt-4 space-y-6">
            <div className="bg-blue-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Accessibility Score</h2>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">Score: {results.score}/100</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Accessibility Issues</h3>
              <ul className="space-y-4">
                {results.issues.map((issue) => (
                  <li key={issue.id} className="bg-gray-100 p-4 rounded shadow-sm">
                    <p className="font-medium">
                      <strong>Issue:</strong> {issue.message}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Impact:</strong> <span className="capitalize">{issue.impact}</span>
                    </p>
                    <p className="mt-2 text-sm">
                      <strong>Suggestion:</strong>{" "}
                      <span className="text-gray-800">{results.suggestions[issue.id]}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

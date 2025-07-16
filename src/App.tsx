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
      const response = await fetch(
        "https://accessibility-analyzer-production.up.railway.app/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: inputValue }),
        }
      );

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold text-center mb-4 text-indigo-800">
          ♿ Accessly – AI-Powered Web Auditor
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Enter a website URL to detect accessibility issues and get instant GPT-powered suggestions.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setUrl(e.target.value);
            }}
            placeholder="e.g., https://example.com"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition disabled:bg-gray-400"
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
            <div className="bg-blue-50 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2 text-blue-800">Accessibility Score</h2>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    results.score > 80
                      ? "bg-green-500"
                      : results.score > 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-gray-700">Score: {results.score}/100</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Accessibility Issues Found</h3>
              <ul className="space-y-4">
                {results.issues.map((issue) => (
                  <li key={issue.id} className="bg-gray-50 border border-gray-200 p-4 rounded shadow-sm">
                    <p className="font-medium text-gray-900">
                      <strong>Issue:</strong> {issue.message}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Impact:</strong>{" "}
                      <span className="capitalize">{issue.impact || "Unknown"}</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      <strong>AI Suggestion:</strong> {results.suggestions[issue.id]}
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

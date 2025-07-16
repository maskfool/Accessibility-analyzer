import express, { Request, Response } from "express";
import cors from "cors";
import { runAxeOnURL } from "./runAxe";
import { getOpenAIResponse } from "./openaiHelper";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001; // Backend on port 5001

// Configure CORS to allow frontend on http://localhost:5173
app.use(cors({
  origin: [
    // 'http://localhost:5173', // ✅ allow local dev
    'https://accessly-ai.vercel.app' // ✅ allow production frontend
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));


// Log requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url} from ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  next();
});

// Handle preflight requests
app.options('/analyze', cors());

app.use(express.json());

app.post("/analyze", async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Valid URL is required" });
  }

  try {
    console.log("🔍 Analyzing URL:", url);
    const results = await runAxeOnURL(url);
    console.log("✅ Axe Results:", results);

    const aiSuggestions = await getOpenAIResponse(results);

    res.json({
      issues: results,
      suggestions: aiSuggestions,
      score: calculateScore(results),
    });
  } catch (err) {
    console.error("❌ Error during analysis:", err);
    res.status(500).json({
      error: "Failed to analyze URL",
      details: (err as Error).message,
    });
  }
});

function calculateScore(results: { impact: string | null | undefined }[]): number {
  const total = results.length;
  const serious = results.filter(
    (i) => i.impact === "serious" || i.impact === "critical"
  ).length;

  const score = Math.max(0, 100 - serious * 10);
  console.log(`📊 Accessibility Score: ${score}`);
  return score;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { runAxeOnURL } from "./runAxe";
import { getOpenAIResponse } from "./openaiHelper";

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS configuration
app.use(cors({
  origin: [
    'https://accessly-ai.vercel.app', // allow production frontend
    // 'http://localhost:5173',       // allow dev frontend (optional)
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// 🔍 Log requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// 🛑 Handle preflight (CORS)
app.options('/analyze', cors());

// 🧠 Body parser
app.use(express.json());

app.post("/analyze", async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Valid URL is required" });
  }

  try {
    console.log("🔍 Analyzing URL:", url);

    // ✅ New: Get both issues & screenshot
    const { issues, screenshot } = await runAxeOnURL(url);

    console.log("✅ Axe Results:", issues);

    const aiSuggestions = await getOpenAIResponse(issues);

    res.json({
      issues,
      suggestions: aiSuggestions,
      score: calculateScore(issues),
      screenshot, // 🖼️ New: include base64 screenshot
    });

  } catch (err) {
    console.error("❌ Error during analysis:", err);
    res.status(500).json({
      error: "Failed to analyze URL",
      details: (err as Error).message,
    });
  }
});

// 📊 Accessibility scoring logic
function calculateScore(results: { impact: string | null | undefined }[]): number {
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

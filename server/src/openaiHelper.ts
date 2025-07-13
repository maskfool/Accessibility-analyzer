import { OpenAI } from "openai";

interface Issue {
  id: string;
  description: string;
  impact: string | null | undefined;
}

// Hardcoded key for now (REPLACE with your actual key securely later)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getOpenAIResponse(
  issues: Issue[]
): Promise<{ [key: string]: string }> {
  const suggestions: { [key: string]: string } = {};

  for (const issue of issues) {
    try {
      const prompt = `
You are an expert web accessibility consultant.

Here is an accessibility issue found on a webpage:

"${issue.description}"

Explain clearly in 2-3 sentences how to fix this issue for a web developer.
Keep it simple and practical.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",  // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
      });

      console.log("Full OpenAI response:", response);

      const content = response.choices[0]?.message?.content?.trim();
      suggestions[issue.id] = content || "Refer to accessibility guidelines";
    } catch (error: any) {
      console.error(`OpenAI error for issue ${issue.id}:`, error.message);
      suggestions[issue.id] = "Refer to accessibility guidelines";
    }
  }

  return suggestions;
}

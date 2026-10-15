/**
 * LLM bridge for AI analyst questions.
 *
 * This service sends the current financial context to a Groq-backed OpenAI
 * compatible endpoint and normalizes the returned JSON so the application can
 * render consistent answers for user questions.
 */
const OpenAI = require("openai");

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are a financial analyst assistant for a small business's P&L review tool.

RULES:
- You will be given structured JSON data (P&L totals, monthly P&L, category totals, and a count of transactions needing review).
- Answer ONLY using numbers and facts present in this JSON. Never invent, estimate, or round a number that is not directly present in the data.
- If the data needed to answer is not present in the JSON, say so explicitly instead of guessing.
- Respond ONLY with valid JSON in this exact shape, no markdown fences, no extra text:
{"answer": "<plain english answer>", "evidence": {"source": "<short description of what data you used>", "raw": <the subset of the input JSON you used>}}`;

const parseModelOutput = (rawText) => {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      answer: parsed.answer,
      evidence: parsed.evidence || null,
    };
  } catch {
    return {
      answer:
        "I couldn't produce a reliable answer to that question from the available data.",
      evidence: null,
    };
  }
};

const callGroq = async (question, context) => {
  const completion = await groqClient.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `DATA:\n${JSON.stringify(
          context
        )}\n\nQUESTION: ${question}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;

  if (!text) {
    throw new Error("No text response from Groq");
  }

  return parseModelOutput(text);
};

const answerWithLLM = async (question, context) => {
  try {
    return await callGroq(question, context);
  } catch (error) {
    console.error("Groq failed:", error.message);
    throw error;
  }
};

module.exports = { answerWithLLM };
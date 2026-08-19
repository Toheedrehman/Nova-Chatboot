const { GoogleGenAI } = require("@google/genai");

const provider = (process.env.AI_PROVIDER || "none").toLowerCase();

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let gemini = null;

// =====================================================
// GEMINI CONFIGURATION
// =====================================================

if (provider === "gemini") {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend/.env");
  }

  gemini = new GoogleGenAI({
    apiKey: geminiApiKey,
  });

  console.log(`[AI] Gemini configured: ${geminiModel}`);
}

// =====================================================
// RETRY HELPER
// =====================================================

function isTemporaryGeminiError(error) {
  const message = JSON.stringify(error).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("temporarily")
  );
}

async function generateGeminiResponse(contents, config) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[AI] Gemini request attempt ${attempt}/${maxRetries}`
      );

      const response = await gemini.models.generateContent({
        model: geminiModel,
        contents,
        config,
      });

      return response;
    } catch (error) {
      console.error(
        `[AI] Gemini attempt ${attempt} failed:`,
        error?.message || error
      );

      // Don't retry permanent errors
      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      // Last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      const delay = attempt * 2000;

      console.log(
        `[AI] Temporary Gemini error. Retrying in ${delay / 1000}s...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// =====================================================
// GENERATE AI REPLY
// =====================================================

async function generateReply(history) {
  // ===================================================
  // GEMINI
  // ===================================================

  if (provider === "gemini") {
    if (!gemini) {
      throw new Error("Gemini client is not configured");
    }

    // -------------------------------------------------
    // CURRENT DATE & TIME — PAKISTAN
    // -------------------------------------------------

    const now = new Date();

    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    });

    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
    });

    // -------------------------------------------------
    // CONVERT MESSAGES TO GEMINI FORMAT
    // -------------------------------------------------

    const contents = history
      .filter((message) => message.content)
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: message.content,
          },
        ],
      }));

    // -------------------------------------------------
    // GEMINI REQUEST
    // -------------------------------------------------

    const response = await generateGeminiResponse(contents, {
      systemInstruction: `
You are Nova, a helpful, friendly, intelligent AI assistant.

CURRENT DATE AND TIME:
Today is ${currentDate}.
Current time in Pakistan is ${currentTime}.

IMPORTANT DATE RULES:
- Use the current date above when answering questions about today, tomorrow, yesterday, this year, or relative dates.
- Never claim that an old date is today's date.
- If the user asks "what is today's date", answer using the current date above.
- If the user asks what day it is, use the current date above.
- If the user asks about current or recent events, be careful about the date and clearly distinguish known historical information from current information.
- Do not invent current events.

AI PROVIDER:
- You are powered by Google Gemini.
- Do not say that you are using OpenAI.
- Do not mention OpenAI quota errors.
- Do not claim that OpenAI is your configured provider.

RESPONSE STYLE:
- Be helpful and natural.
- Answer the user's actual question directly.
- Keep simple questions concise.
- Give detailed explanations when appropriate.
- Use Markdown when it improves readability.
- If you don't know something, say so rather than inventing information.

You are Nova.
      `,

      temperature: 0.7,
    });

    // -------------------------------------------------
    // EXTRACT RESPONSE
    // -------------------------------------------------

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  }

  // ===================================================
  // NO AI PROVIDER
  // ===================================================

  if (provider === "none") {
    return "I'm running without an AI provider configured right now. Set AI_PROVIDER=gemini and GEMINI_API_KEY in backend/.env to enable Nova.";
  }

  // ===================================================
  // UNSUPPORTED PROVIDER
  // ===================================================

  throw new Error(`Unsupported AI provider: ${provider}`);
}

module.exports = {
  generateReply,
};
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

async function callOpenAI(apiKey, payload) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0,
      ...payload,
    }),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.error?.message || message;
    } catch (err) {
      // ignore parsing error
    }
    throw new Error(message);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response missing content.");
  }
  return content.trim();
}

export async function detectLanguageWithOpenAI(apiKey, text) {
  if (!apiKey) throw new Error("Missing OpenAI API key.");
  const snippet = text.slice(0, 5500);
  const content = await callOpenAI(apiKey, {
    temperature: 0.1,
    max_tokens: 32,
    messages: [
      {
        role: "system",
        content:
          "You are a precise language detection utility. Reply with ONLY the primary language name in English, e.g., 'German'.",
      },
      {
        role: "user",
        content: `Detect the primary language of the following content. Respond with the language name only.\n\nContent:\n"""${snippet}"""`,
      },
    ],
  });
  return content.replace(/[".]/g, "").trim();
}

function safeParseJSON(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    try {
      const cleaned = maybeJson
        .split("\n")
        .slice(1, -1)
        .join("\n")
        .trim();
      return JSON.parse(cleaned);
    } catch {
      throw new Error("Invalid JSON payload returned by OpenAI.");
    }
  }
}

export async function translateEmailWithOpenAI(
  apiKey,
  { subject, body, targetLanguage, sourceLanguage, additionalInstructions = "" }
) {
  if (!apiKey) throw new Error("Missing OpenAI API key.");
  const limitedBody =
    body.length > 6000 ? `${body.slice(0, 6000)}…` : body || "(no body)";
  const guidance = additionalInstructions
    ? `\n\nAdditional instructions for the localized version:\n"""${additionalInstructions}"""`
    : "";
  const prompt = `Translate the following email from ${sourceLanguage ||
    "an unknown language"} to ${targetLanguage}. Preserve URLs, CTA placeholders, numeric values, and required disclaimers.${guidance}\n\nSubject:\n"""${subject || "(no subject)"}"""\n\nBody:\n"""${limitedBody}"""`;

  const content = await callOpenAI(apiKey, {
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content:
          "You are an expert localization linguist. Always reply with JSON only.",
      },
      { role: "user", content: prompt },
    ],
  });

  let parsed;
  try {
    parsed = safeParseJSON(content);
  } catch (err) {
    throw new Error("Failed to parse translation response.");
  }

  return {
    subject: parsed.subject || subject || "(no subject)",
    body: parsed.body || limitedBody,
  };
}

export async function translateTextToEnglish(
  apiKey,
  text,
  sourceLanguage = "Unknown"
) {
  if (!apiKey) throw new Error("Missing OpenAI API key.");
  const limited =
    text.length > 7000 ? `${text.slice(0, 7000)}…` : text || "(empty)";
  const prompt = `Translate the following compliance requirements from ${sourceLanguage} into clear, professional English suitable for prompting AI systems. Preserve numbered or bulleted structure when present. Respond with English text only.\n\nContent:\n"""${limited}"""`;

  const content = await callOpenAI(apiKey, {
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "You are a careful translator who converts policy documents into business English without adding commentary.",
      },
      { role: "user", content: prompt },
    ],
  });
  return content;
}

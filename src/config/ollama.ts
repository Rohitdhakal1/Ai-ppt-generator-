/**
 * Ollama Local AI Service
 * This service handles communication with a locally running Ollama instance.
 */

const OLLAMA_BASE_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "llama3";

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export const generateWithOllama = async (
  prompt: string,
  model = DEFAULT_MODEL
): Promise<string> => {
  try {
    const response = await fetch(OLLAMA_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false, // Set to false for full response at once
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    throw error;
  }
};

/**
 * Streams the response from Ollama via fetch and ReadableStream
 */
export const streamWithOllama = async (
  prompt: string,
  onChunk: (text: string) => void,
  model = DEFAULT_MODEL
): Promise<string> => {
  try {
    const response = await fetch(OLLAMA_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Ollama returned no body for streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Ollama returns NDJSON (sequence of JSON objects)
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json: OllamaResponse = JSON.parse(line);
          if (json.response) {
            fullContent += json.response;
            onChunk(json.response);
          }
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }

    return fullContent;
  } catch (error) {
    throw error;
  }
};

/**
 * Robustly extracts JSON from a potentially noisy string.
 * Finds the first [ or { and the last ] or }.
 */
/**
 * Robustly extracts a JSON block (array or object) from a string.
 */
export const extractJSON = (text: string): string => {
  // 1. Precise Markdown Block Extraction
  const markdownMatch = text.match(/```json\s*([\s\S]*?)(?:```|$)/);
  if (markdownMatch) return markdownMatch[1].trim();

  // 2. Identify Boundary Markers
  const firstBracket = text.indexOf("[");
  const firstBrace = text.indexOf("{");

  let startIdx = -1;
  let startChar = "";
  let endChar = "";

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIdx = firstBracket;
    startChar = "[";
    endChar = "]";
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    startChar = "{";
    endChar = "}";
  }

  if (startIdx === -1) return text.trim();

  // 3. Balanced Character Matching
  // This ensures we find the EXACT end of the JSON block even if there's noise after it
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === startChar) depth++;
      if (char === endChar) {
        depth--;
        if (depth === 0) {
          return text.substring(startIdx, i + 1).trim();
        }
      }
    }
  }

  // Fallback for streaming (partial JSON)
  return text.substring(startIdx).trim();
};

/**
 * Robustly extracts HTML content from a string.
 */
export const extractHTML = (text: string): string => {
  const markdownMatch = text.match(/```html\s*([\s\S]*?)\s*```/);
  if (markdownMatch) return markdownMatch[1].trim();

  const firstDiv = text.indexOf("<div");
  const lastDiv = text.lastIndexOf("</div>");

  if (firstDiv !== -1 && lastDiv !== -1) {
    return text.substring(firstDiv, lastDiv + 6).trim();
  }

  return text.trim();
};

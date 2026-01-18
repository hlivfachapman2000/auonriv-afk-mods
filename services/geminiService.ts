import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends a message to Gemini.
 * Supports text-only OR text + image (multimodal).
 */
export const sendChatMessage = async (
  history: { role: string; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[],
  newMessage: string,
  base64Image?: string
): Promise<string> => {
  const ai = getClient();
  
  // Use 2.5-flash-image if we have visual data, otherwise 3-flash for pure text speed
  const model = base64Image ? "gemini-2.5-flash-image" : "gemini-3-flash-preview";

  const systemPrompt = `
    You are "Rivals Tactician", an AI assistant for a Game Automation Tool.
    
    CAPABILITIES:
    1. You can see the game screen if the user attaches an image.
    2. You help identify objects (enemies, mountains, UI elements) coordinates.
    3. You help create macros.

    If the user sends an image, analyze the UI elements, player position, or specific map landmarks they ask about.
    Keep answers concise and "gamer-like".
  `;

  // Construct current turn parts
  const currentParts: any[] = [{ text: newMessage }];
  
  if (base64Image) {
      currentParts.unshift({
          inlineData: {
              mimeType: "image/png",
              data: base64Image
          }
      });
  }

  // Filter history to ensure it matches the format expected by the SDK
  // Note: For simple chat in this demo, we might truncate history if switching models to avoid compatibility issues,
  // but usually Flash handles it well.
  const formattedHistory = history.map(h => ({
      role: h.role,
      parts: h.parts
  }));

  const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...formattedHistory,
      { role: 'user', parts: currentParts }
  ];

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents
  });

  return response.text || "Systems unresponsive. Try again.";
};

/**
 * Legacy Analysis (kept for the Analyzer component if needed)
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  const model = "gemini-2.5-flash-image";

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        {
          text: "Analyze this Marvel Rivals screenshot. Identify the current game state."
        }
      ]
    }
  });

  return response.text || "Analysis complete.";
};

export const analyzeVideo = async (base64Data: string, mimeType: string): Promise<string> => {
    // Placeholder for video analysis logic
    return "Video analysis requires different handling.";
};
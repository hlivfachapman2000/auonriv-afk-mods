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
 * Sends a text message to Gemini (Chat).
 * Supports generating dynamic modules via JSON output.
 */
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  const ai = getClient();
  // Switched to Flash for speed as requested for the chat agent
  const model = "gemini-3-flash-preview";

  const systemPrompt = `
    You are "Rivals Tactician", an AI coding assistant for a Game Automation Tool.
    
    Your goal is to help the user create new "AFK Modules" or discuss strategy.
    
    CRITICAL INSTRUCTION FOR CREATING FEATURES:
    If the user asks to create a feature, script, or function (e.g., "Make a jump script", "Press E every 10s", "Anti-AFK strafe"), 
    you MUST output a JSON block at the end of your message describing the module.
    
    The JSON format must be:
    \`\`\`json
    {
      "type": "NEW_MODULE",
      "name": "Short Name (e.g., Auto-Strafe)",
      "description": "Short description of what it does",
      "key": "Key to press (e.g., SPACE, E, W, CTRL)",
      "interval": 5000, // Time in milliseconds
      "actionLogMessage": "Log message (e.g., Strafing Left)"
    }
    \`\`\`
    
    If just chatting about strategy, do not include the JSON.
    Keep text responses concise and "hacker-like".
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] }, // Inject system prompt as first turn context or system instruction
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: [{ text: newMessage }] }
    ]
  });

  return response.text || "Systems unresponsive. Try again.";
};

/**
 * Analyzes an image (Screenshot) using Gemini Vision.
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  const model = "gemini-3-pro-preview";

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
          text: "Analyze this Marvel Rivals screenshot. Identify the current game state (Lobby, In-Game, Scoreboard, Victory/Defeat). If in-game, suggest a quick tactical tip based on the visible heroes or map position. If it's a menu, describe what is selected."
        }
      ]
    }
  });

  return response.text || "Analysis complete. No significant data found.";
};

/**
 * Analyzes a video clip.
 */
export const analyzeVideo = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  const model = "gemini-3-pro-preview"; 

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
          text: "Analyze this gameplay clip from Marvel Rivals. Describe the player's movement patterns. Are they strafing effectively? detecting any AFK behavior? Provide a critique on the playstyle shown."
        }
      ]
    }
  });

  return response.text || "Video analysis complete.";
};
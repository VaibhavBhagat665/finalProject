
import { GoogleGenAI, type Chat, type GenerateContentResponse, type Content } from "@google/genai";
import { GEMINI_CHAT_MODEL, GEMINI_SYSTEM_INSTRUCTION } from './constants';

const apiKeyFromEnv = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKeyFromEnv) {
  ai = new GoogleGenAI({ apiKey: apiKeyFromEnv });
} else {
  console.warn("Gemini API key (process.env.API_KEY) is not configured. Chatbot functionality will be limited.");
}

let chatInstance: Chat | null = null;

export async function startChatSession(history: Content[] = []): Promise<void> {
  if (!ai) {
    console.error("Gemini AI not initialized. Cannot start chat session because API key is not configured.");
    // chatInstance will remain null, and sendMessage will fail gracefully.
    return;
  }
  try {
    chatInstance = ai.chats.create({
      model: GEMINI_CHAT_MODEL,
      history: history,
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      }
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    chatInstance = null; // Ensure chatInstance is null on error
    throw error; // Rethrow to allow caller to handle
  }
}


export async function sendMessageToGemini(
  message: string,
  onStreamUpdate: (chunkText: string, isFinal: boolean) => void
): Promise<void> {
  if (!ai) {
    onStreamUpdate("Chatbot is not available: API key not configured.", true);
    return;
  }

  if (!chatInstance) {
    try {
      await startChatSession(); 
      if (!chatInstance) { // Check again after attempting to start
        onStreamUpdate("Chatbot is not available: Could not start session.", true);
        return;
      }
    } catch (error) {
      console.error("Failed to auto-initialize chat session:", error);
      onStreamUpdate("Chatbot is not available: Error starting session.", true);
      return;
    }
  }

  try {
    const result = await chatInstance.sendMessageStream({ message });
    let fullResponseText = ""; // Not strictly needed here if only streaming chunks
    for await (const chunk of result) { // chunk is GenerateContentResponse
      const chunkText = chunk.text; // Access text directly as per guideline
      if (chunkText) {
        // fullResponseText += chunkText; // Accumulation can be handled by the UI if needed
        onStreamUpdate(chunkText, false); // Stream intermediate chunk
      }
    }
    onStreamUpdate("", true); // Signal end of stream (empty text, isFinal=true)
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    onStreamUpdate("Sorry, I encountered an error. Please try again.", true);
  }
}

export function isGeminiAvailable(): boolean {
  return !!ai;
}

// Helper to convert app's ChatMessage format to Gemini's Content format for history
export function convertMessagesToGeminiHistory(messages: import('./types').ChatMessage[]): Content[] {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model', // Gemini uses 'user' and 'model'
    parts: [{ text: msg.text }],
  }));
}

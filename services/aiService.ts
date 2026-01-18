// Implementation follows @google/genai guidelines:
// - Uses gemini-3-flash-preview for basic data analysis tasks.
// - Uses process.env.API_KEY directly for initialization.
// - Accesses response.text as a property, not a method.
// - Configures structured JSON output with responseSchema.

import { GoogleGenAI, Type } from "@google/genai";
import { InventoryRecord } from "../types";

/**
 * Analyzes inventory data and returns professional, actionable insights.
 * Uses Gemini AI to identify trends, branch performance, and potential stock risks.
 */
export const getInventoryInsights = async (data: InventoryRecord[]) => {
  if (!data || data.length === 0) return null;

  // Initialize the Gemini client with the pre-configured API key from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Generate content using gemini-3-flash-preview for efficient text and data analysis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a strategic analysis of these inventory records: ${JSON.stringify(data.slice(0, 50))}. 
      Highlight significant stock trends, branch efficiency, and risks like overstocking or low stock levels.`,
      config: {
        systemInstruction: "You are a senior supply chain consultant. Provide brief, actionable inventory insights in a structured JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { 
                    type: Type.STRING,
                    description: "Short headline of the insight."
                  },
                  description: { 
                    type: Type.STRING,
                    description: "Detailed analysis and recommendation."
                  },
                  severity: { 
                    type: Type.STRING, 
                    description: "Impact level: 'low', 'medium', or 'high'." 
                  }
                },
                required: ["title", "description", "severity"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    // Extract the text response using the .text property as defined in the SDK.
    const jsonStr = response.text;
    if (jsonStr) {
      return JSON.parse(jsonStr.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
};
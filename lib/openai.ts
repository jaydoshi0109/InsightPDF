import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";
import OpenAI from "openai";

// Debug log the environment variables (don't log the actual key)
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '***' : 'Not found');

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key. Please set OPENAI_API_KEY in your .env file");
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Add timeout and other configurations
  timeout: 30000, // 30 seconds timeout
  maxRetries: 2,
});
export async function generateSummaryFromOpenAI(pdfText: string) {
  ;
  ;
  // Truncate very long texts to avoid token limits
  const MAX_TOKENS = 8000; // Roughly 4 chars per token, so ~32k characters
  const truncatedText = pdfText.length > MAX_TOKENS * 4 
    ? pdfText.substring(0, MAX_TOKENS * 4) + '... [truncated]' 
    : pdfText;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using the latest model
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting. Focus on key points and main ideas. Document content:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    const summary = completion.choices?.[0]?.message?.content || "No summary generated.";
    ;
    return summary;
  } catch (error: any) {
    ;
    if (error?.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED: You've hit the rate limit. Please wait a moment and try again.");
    } else if (error?.code === 'invalid_api_key') {
      throw new Error("INVALID_API_KEY: The provided OpenAI API key is invalid. Please check your .env file.");
    } else if (error?.code === 'insufficient_quota') {
      throw new Error("INSUFFICIENT_QUOTA: You've exceeded your current OpenAI usage. Please check your billing.");
    } else {
      throw new Error(`OpenAI API Error: ${error.message || 'Unknown error occurred'}`);
    }
  }
}

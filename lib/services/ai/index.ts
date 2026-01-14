/**
 * AI Service Registry
 *
 * This file provides a factory for creating AI service instances.
 * To add a new model:
 * 1. Create a new service class implementing AIService interface
 * 2. Add it to the AIModelType enum
 * 3. Add a case in the createAIService function
 */

import { AIService } from "./types";
import { DeepSeekService } from "./deepseek";

export * from "./types";

/**
 * Available AI models
 * Add new models here as they become available
 */
export enum AIModelType {
  DEEPSEEK = "deepseek",
  // Future models can be added here:
  // GPT4 = "gpt4",
  // CLAUDE = "claude",
  // CUSTOM_MODEL = "custom",
}

/**
 * Factory function to create AI service instances
 */
export function createAIService(
  modelType: AIModelType,
  apiKey: string
): AIService {
  switch (modelType) {
    case AIModelType.DEEPSEEK:
      return new DeepSeekService(apiKey);

    // Future models can be added here:
    // case AIModelType.GPT4:
    //   return new GPT4Service(apiKey);
    //
    // case AIModelType.CLAUDE:
    //   return new ClaudeService(apiKey);
    //
    // case AIModelType.CUSTOM_MODEL:
    //   return new CustomModelService(apiKey);

    default:
      throw new Error(`Unknown AI model type: ${modelType}`);
  }
}

/**
 * Get the default AI service (used if no preference is set)
 */
export function getDefaultAIService(): AIService {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return createAIService(AIModelType.DEEPSEEK, apiKey);
}

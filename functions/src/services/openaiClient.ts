import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { env } from "../shared/env";

let cached: AzureOpenAI | null = null;

export function getOpenAIClient(): AzureOpenAI {
  if (cached) return cached;

  const endpoint = env.openai.endpoint();
  const apiVersion = env.openai.apiVersion();
  const apiKey = env.openai.apiKey();

  if (apiKey) {
    cached = new AzureOpenAI({ endpoint, apiKey, apiVersion });
  } else {
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(
      credential,
      "https://cognitiveservices.azure.com/.default"
    );
    cached = new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion });
  }

  return cached;
}

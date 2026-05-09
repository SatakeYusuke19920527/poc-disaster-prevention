import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { DefaultAzureCredential } from "@azure/identity";
import { env } from "../shared/env";

interface IndexedDoc {
  id?: string;
  title?: string;
  content?: string;
  source?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

let cached: SearchClient<IndexedDoc> | null = null;

export function getSearchClient(): SearchClient<IndexedDoc> | null {
  if (cached) return cached;
  const endpoint = env.search.endpoint();
  const index = env.search.index();
  if (!endpoint) return null;

  const apiKey = env.search.apiKey();
  cached = apiKey
    ? new SearchClient<IndexedDoc>(endpoint, index, new AzureKeyCredential(apiKey))
    : new SearchClient<IndexedDoc>(endpoint, index, new DefaultAzureCredential());
  return cached;
}

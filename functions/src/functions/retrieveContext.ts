import * as df from "durable-functions";
import { InvocationContext } from "@azure/functions";
import { getSearchClient } from "../services/searchClient";
import type { RetrievedDocument } from "../types/chat";

interface Input {
  query: string;
  intent: string;
  topK: number;
}

export async function retrieveContext(
  input: Input,
  context: InvocationContext
): Promise<RetrievedDocument[]> {
  const client = getSearchClient();
  if (!client) {
    context.log("AI Search not configured; returning empty documents.");
    return [];
  }

  const results: RetrievedDocument[] = [];
  try {
    const response = await client.search(input.query, {
      top: input.topK,
      queryType: "simple",
    });
    for await (const r of response.results) {
      const doc = r.document;
      results.push({
        title: doc.title ?? "Untitled",
        content: doc.content ?? "",
        source: doc.source ?? "unknown",
        url: doc.url,
        score: r.score,
        metadata: doc.metadata,
      });
    }
  } catch (e) {
    context.error("retrieveContext failed", e);
    return [];
  }
  return results;
}

df.app.activity("retrieveContext", { handler: retrieveContext });

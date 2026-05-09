import { Container, CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { env } from "../shared/env";

let cachedContainer: Container | null = null;

export function getConversationsContainer(): Container | null {
  if (cachedContainer) return cachedContainer;
  const endpoint = env.cosmos.endpoint();
  if (!endpoint) return null;

  const key = env.cosmos.key();
  const client = key
    ? new CosmosClient({ endpoint, key })
    : new CosmosClient({ endpoint, aadCredentials: new DefaultAzureCredential() });

  cachedContainer = client
    .database(env.cosmos.database())
    .container(env.cosmos.conversations());
  return cachedContainer;
}

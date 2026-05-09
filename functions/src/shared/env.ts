export function getEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === "") return undefined;
  return v;
}

export function requireEnv(name: string): string {
  const v = getEnv(name);
  if (!v) {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return v;
}

export const env = {
  openai: {
    endpoint: () => requireEnv("AZURE_OPENAI_ENDPOINT"),
    apiKey: () => getEnv("AZURE_OPENAI_API_KEY"),
    apiVersion: () => getEnv("AZURE_OPENAI_API_VERSION") ?? "2024-10-21",
    deployments: {
      intent: () => requireEnv("AZURE_OPENAI_DEPLOYMENT_INTENT"),
      furusato: () => requireEnv("AZURE_OPENAI_DEPLOYMENT_FURUSATO"),
      disasterSimulation: () =>
        requireEnv("AZURE_OPENAI_DEPLOYMENT_DISASTER_SIMULATION"),
      disasterLearning: () =>
        requireEnv("AZURE_OPENAI_DEPLOYMENT_DISASTER_LEARNING"),
    },
  },
  search: {
    endpoint: () => getEnv("AZURE_SEARCH_ENDPOINT"),
    apiKey: () => getEnv("AZURE_SEARCH_API_KEY"),
    index: () => getEnv("AZURE_SEARCH_INDEX") ?? "disaster-index",
  },
  cosmos: {
    endpoint: () => getEnv("COSMOS_ENDPOINT"),
    key: () => getEnv("COSMOS_KEY"),
    database: () => getEnv("COSMOS_DATABASE") ?? "poc-disaster",
    conversations: () =>
      getEnv("COSMOS_CONTAINER_CONVERSATIONS") ?? "conversations",
  },
  blob: {
    connectionString: () => getEnv("BLOB_CONNECTION_STRING"),
    container: () => getEnv("BLOB_CONTAINER_ASSETS") ?? "assets",
  },
  appInsights: {
    connectionString: () => getEnv("APPLICATIONINSIGHTS_CONNECTION_STRING"),
  },
  maps: {
    subscriptionKey: () => requireEnv("AZURE_MAPS_SUBSCRIPTION_KEY"),
  },
};

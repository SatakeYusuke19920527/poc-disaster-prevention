import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { env } from "../shared/env";

let cached: ContainerClient | null = null;

export function getAssetsContainer(): ContainerClient | null {
  if (cached) return cached;
  const conn = env.blob.connectionString();
  if (!conn) return null;
  cached = BlobServiceClient.fromConnectionString(conn).getContainerClient(
    env.blob.container()
  );
  return cached;
}

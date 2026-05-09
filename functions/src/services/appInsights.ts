import * as appInsights from "applicationinsights";
import { env } from "../shared/env";

let started = false;

export function initAppInsights(): appInsights.TelemetryClient | null {
  const conn = env.appInsights.connectionString();
  if (!conn) return null;
  if (!started) {
    appInsights
      .setup(conn)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(false)
      .setSendLiveMetrics(false)
      .start();
    started = true;
  }
  return appInsights.defaultClient ?? null;
}

export function getTelemetryClient(): appInsights.TelemetryClient | null {
  return initAppInsights();
}

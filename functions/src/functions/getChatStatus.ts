import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as df from "durable-functions";

export async function getChatStatus(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const instanceId = req.params.instanceId;
  if (!instanceId || instanceId === "undefined" || instanceId === "null") {
    return { status: 400, jsonBody: { error: "instanceId is required." } };
  }

  const client = df.getClient(context);
  let status;
  try {
    status = await client.getStatus(instanceId, {
    showInput: false,
    showHistory: false,
    showHistoryOutput: false,
    });
  } catch (e) {
    context.error("getStatus failed", e);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch orchestration status." },
    };
  }

  if (!status) {
    return { status: 404, jsonBody: { error: "Instance not found." } };
  }

  return {
    status: 200,
    jsonBody: {
      instanceId: status.instanceId,
      runtimeStatus: status.runtimeStatus,
      output: status.output,
      customStatus: status.customStatus,
      createdTime: status.createdTime,
      lastUpdatedTime: status.lastUpdatedTime,
    },
  };
}

app.http("getChatStatus", {
  route: "chat/status/{instanceId}",
  methods: ["GET"],
  authLevel: "anonymous",
  extraInputs: [df.input.durableClient()],
  handler: getChatStatus,
});

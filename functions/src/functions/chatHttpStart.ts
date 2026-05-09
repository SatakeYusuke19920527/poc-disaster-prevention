import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { ValidationError, validateChatRequest } from "../shared/validate";
import { safeErrorMessage } from "../shared/errors";
import type { OrchestratorInput } from "../types/chat";

export async function chatHttpStart(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { status: 400, jsonBody: { error: "Invalid JSON body." } };
  }

  let chatRequest;
  try {
    chatRequest = validateChatRequest(body);
  } catch (e) {
    if (e instanceof ValidationError) {
      return { status: e.status, jsonBody: { error: e.message } };
    }
    return { status: 400, jsonBody: { error: safeErrorMessage(e) } };
  }

  const client = df.getClient(context);
  const input: OrchestratorInput = {
    request: chatRequest,
    startedAtMs: Date.now(),
  };

  const instanceId = await client.startNew("chatOrchestrator", { input });
  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return client.createCheckStatusResponse(req, instanceId);
}

app.http("chatHttpStart", {
  route: "chat/start",
  methods: ["POST"],
  authLevel: "anonymous",
  extraInputs: [df.input.durableClient()],
  handler: chatHttpStart,
});

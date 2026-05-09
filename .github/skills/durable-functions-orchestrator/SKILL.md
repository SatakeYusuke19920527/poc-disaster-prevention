---
name: durable-functions-orchestrator
description: Use this skill when implementing Azure Durable Functions orchestration for the multi-agent chat workflow.
---

# Durable Functions Orchestrator Skill

## Purpose

Implement the backend workflow using Azure Functions and Durable Functions.

Durable Functions should coordinate the multi-step chat workflow and multi-agent execution. The orchestrator controls the order of work. Activity functions perform actual external service calls.

## Core rule

The orchestrator must be deterministic.

## Orchestrator rules

- Do not call Azure OpenAI directly from the orchestrator.
- Do not call Azure AI Search directly from the orchestrator.
- Do not call Cosmos DB directly from the orchestrator.
- Do not call Blob Storage directly from the orchestrator.
- Do not call Application Insights directly from the orchestrator if the call is non-deterministic.
- Do not use random values in the orchestrator.
- Do not use current time directly in the orchestrator.
- Do not perform HTTP calls directly in the orchestrator.
- Use activity functions for all external calls.
- Keep orchestration logic focused on workflow order, branching, retries, and result aggregation.

## Recommended functions

- `chatHttpStart`
- `chatOrchestrator`
- `getChatStatus`
- `loadConversation`
- `classifyIntent`
- `retrieveContext`
- `runFurusatoAgent`
- `runDisasterSimulationAgent`
- `runDisasterLearningAgent`
- `aggregateAnswer`
- `applyGuardrails`
- `saveConversation`
- `trackTelemetry`

## Recommended request flow

1. `chatHttpStart` receives a request from the frontend.
2. `chatHttpStart` starts `chatOrchestrator`.
3. `chatOrchestrator` calls `loadConversation`.
4. `chatOrchestrator` calls `classifyIntent`.
5. `chatOrchestrator` calls `retrieveContext` if needed.
6. `chatOrchestrator` calls the selected agent activity.
7. `chatOrchestrator` calls `aggregateAnswer` if multiple agent outputs exist.
8. `chatOrchestrator` calls `applyGuardrails`.
9. `chatOrchestrator` calls `saveConversation`.
10. `chatOrchestrator` calls `trackTelemetry`.
11. `chatOrchestrator` returns the final response.

## Fan-out / fan-in pattern

Use fan-out / fan-in when multiple agents should run in parallel.

Example use cases:

- Run Disaster Simulation Agent and Disaster Learning Agent in parallel.
- Compare multiple candidate answers.
- Retrieve context from multiple indexes.

## Retry rules

- Add retry policies for Azure OpenAI calls.
- Add retry policies for Azure AI Search calls.
- Add retry policies for Cosmos DB writes where appropriate.
- Do not retry unsafe operations without idempotency.

## Error handling

- Return structured errors.
- Track failures in Application Insights.
- Preserve `instanceId` for troubleshooting.
- Avoid exposing internal error details to frontend users.

## Output shape

The final orchestration output should be structured.

```json
{
  "answer": "string",
  "agent": "furusato | disaster-simulation | disaster-learning | multi-agent",
  "citations": [],
  "metadata": {
    "intent": "string",
    "latencyMs": 0,
    "tokenUsage": {
      "input": 0,
      "output": 0
    }
  }
}
```

---
name: nextjs-frontend
description: Use this skill when implementing the Next.js frontend for the disaster preparedness multi-agent chat application.
---

# Next.js Frontend Skill

## Purpose

Implement the frontend application using Next.js App Router and TypeScript.

The frontend is responsible for user experience only. It must not directly call Azure OpenAI, Azure AI Search, Cosmos DB, or Blob Storage.

## Main responsibilities

- Render the chat UI.
- Render the map or digital map panel if needed.
- Send chat requests to Azure Functions.
- Receive a Durable Functions orchestration instance ID.
- Poll the status endpoint until the orchestration completes.
- Display the final answer, selected agent, and citations if available.
- Display loading and error states.

## Directory rules

- Keep pages under `frontend/app`.
- Keep reusable UI components under `frontend/components`.
- Keep API client code under `frontend/lib`.
- Keep shared frontend types under `frontend/lib/types.ts` or `frontend/types`.
- Keep static files under `frontend/public`.

## API rules

- Use `NEXT_PUBLIC_API_BASE_URL` for the backend API endpoint.
- Do not hardcode API URLs in components.
- Do not expose secrets in frontend code.
- Do not call Azure OpenAI directly from the frontend.
- Do not call Azure AI Search directly from the frontend.
- Do not call Cosmos DB directly from the frontend.
- Do not call Blob Storage directly from the frontend.

## Recommended components

- `ChatWindow`
- `MessageList`
- `MessageInput`
- `AgentSelector`
- `MapPanel`
- `LoadingIndicator`
- `ErrorMessage`

## Recommended API flow

1. User sends a message.
2. Frontend calls `POST /api/chat/start` on Azure Functions.
3. Backend returns an `instanceId` and status URL.
4. Frontend polls `GET /api/chat/status/{instanceId}`.
5. When the status is `Completed`, display the final answer.
6. When the status is `Failed`, display a user-friendly error message.

## Chat request shape

```json
{
  "sessionId": "session-001",
  "userId": "user-001",
  "message": "地震が起きたら何をすればいい？",
  "agentMode": "auto"
}
```

## Chat response shape

```json
{
  "answer": "まず身の安全を確保してください...",
  "agent": "disaster-simulation",
  "citations": [],
  "metadata": {
    "latencyMs": 1200,
    "tokenUsage": {
      "input": 0,
      "output": 0
    }
  }
}
```

## UI requirements

- Show user and assistant messages clearly.
- Show which agent responded when available.
- Show citations or source references when available.
- Show loading state while the orchestration is running.
- Show retry option when the API call fails.
- Keep the UI simple and easy to demo.

# Copilot Instructions

This repository implements a multi-agent disaster preparedness chat service using Next.js, Azure Functions, Durable Functions, Azure OpenAI Service, Azure AI Search, Cosmos DB, Blob Storage, and Application Insights.

## Repository structure

This repository is organized as a simple monorepo.

- `frontend/` contains the Next.js application.
- `functions/` contains Azure Functions and Durable Functions.
- `.github/skills/` contains GitHub Copilot Agent Skills.
- `docs/` may contain architecture, migration, and operations documentation.
- `infra/` may contain Azure infrastructure definitions.

## Architecture

Use the following Azure services:

- Azure Functions
- Durable Functions
- Azure OpenAI Service
- Azure AI Search
- Azure Cosmos DB
- Azure Blob Storage
- Application Insights

## Core design principles

- Use Durable Functions for multi-step and multi-agent workflows.
- Use an orchestrator function to control workflow order and agent execution.
- Use activity functions for all external service calls.
- Do not call Azure OpenAI directly from the orchestrator.
- Do not call Azure AI Search directly from the orchestrator.
- Do not access Cosmos DB directly from the orchestrator.
- Do not access Blob Storage directly from the orchestrator.
- Keep orchestrator logic deterministic.
- Store conversation history in Cosmos DB.
- Store files and reference assets in Blob Storage.
- Use Azure AI Search for RAG retrieval.
- Track token usage, latency, intent, errors, and agent execution results in Application Insights.
- Never hardcode secrets.
- Use environment variables for all endpoints, keys, deployment names, and connection strings.

## Frontend rules

- Use Next.js App Router.
- Use TypeScript.
- Keep pages under `frontend/app`.
- Keep reusable components under `frontend/components`.
- Keep API client logic under `frontend/lib`.
- Do not call Azure OpenAI directly from the frontend.
- Do not call Azure AI Search directly from the frontend.
- Do not expose Azure resource keys in frontend code.
- Only call the Azure Functions API from the frontend.
- Use `NEXT_PUBLIC_API_BASE_URL` for the backend API endpoint.

## Backend rules

- Use TypeScript for Azure Functions.
- Keep Azure Functions under `functions/src/functions`.
- Keep Azure service clients under `functions/src/services`.
- Keep prompt files under `functions/src/prompts`.
- Keep shared types under `functions/src/types`.
- Keep validation and common utilities under `functions/src/shared`.

## Agents

The application has the following agents:

- Furusato Agent
- Disaster Simulation Agent
- Disaster Learning Agent

## Request flow

1. Receive a chat request from the frontend.
2. Start a Durable Functions orchestration.
3. Load conversation history from Cosmos DB.
4. Classify the user intent.
5. Retrieve context from Azure AI Search and Blob Storage if needed.
6. Execute the selected agent using Azure OpenAI.
7. Apply guardrails.
8. Save the conversation to Cosmos DB.
9. Track telemetry in Application Insights.
10. Return the response to the frontend.

## Coding rules

- Use TypeScript.
- Keep functions small and focused.
- Prefer clear file names and explicit types.
- Add error handling for all external service calls.
- Add retry policies where appropriate.
- Validate request payloads.
- Avoid logging sensitive user input or secrets.
- Prefer structured JSON responses.
- Add comments only when they clarify non-obvious behavior.

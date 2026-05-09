---
name: disaster-agents
description: Use this skill when implementing the Furusato Agent, Disaster Simulation Agent, and Disaster Learning Agent using Azure OpenAI Service.
---

# Disaster Agents Skill

## Purpose

Implement the application agents using Azure OpenAI Service.

The application supports three primary agents:

- Furusato Agent
- Disaster Simulation Agent
- Disaster Learning Agent

## Agent responsibilities

### Furusato Agent

Use this agent for local community, hometown, tourism, regional information, and local context questions.

### Disaster Simulation Agent

Use this agent for disaster preparedness simulations, scenario-based questions, evacuation behavior, and what-if analysis.

### Disaster Learning Agent

Use this agent for disaster preparedness education, learning support, explanations, quizzes, and guided exploration.

## Azure OpenAI rules

- Use Azure OpenAI Service, not the public OpenAI API.
- Read endpoint, API key, API version, and deployment names from environment variables.
- Do not hardcode secrets.
- Keep each agent's system prompt separate.
- Keep prompts under `functions/src/prompts`.
- Return structured JSON when possible.
- Track token usage and latency.
- Handle API errors gracefully.

## Environment variables

Use environment variables such as:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_DEPLOYMENT_FURUSATO`
- `AZURE_OPENAI_DEPLOYMENT_DISASTER_SIMULATION`
- `AZURE_OPENAI_DEPLOYMENT_DISASTER_LEARNING`

## Safety rules for disaster-related responses

- Do not fabricate official disaster alerts.
- Clearly separate simulation results from official warnings.
- Encourage users to follow local government, fire department, police, and emergency service guidance.
- Avoid overconfident life-threatening instructions.
- When information may be location-specific, say that local official guidance should be checked.
- Do not provide false certainty about real-time disaster conditions.

## Prompt design rules

Each agent prompt should define:

- Role
- Scope
- Input format
- Output format
- Safety constraints
- Citation handling
- Refusal or escalation behavior

## Recommended agent output

```json
{
  "agent": "disaster-simulation",
  "answer": "string",
  "citations": [],
  "confidence": "low | medium | high",
  "safetyNotes": [],
  "tokenUsage": {
    "input": 0,
    "output": 0
  }
}
```

## Agent selection

Use `agentMode` from the frontend when explicitly provided.

When `agentMode` is `auto`, use intent classification to choose the agent.

Allowed values:

- `auto`
- `furusato`
- `disaster-simulation`
- `disaster-learning`

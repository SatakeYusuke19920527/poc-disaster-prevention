---
name: ai-search-rag
description: Use this skill when implementing retrieval augmented generation using Azure AI Search and Blob Storage.
---

# AI Search RAG Skill

## Purpose

Implement retrieval augmented generation using Azure AI Search and Blob Storage.

Azure AI Search retrieves relevant context. Blob Storage stores original files, reference assets, images, maps, and documents.

## Core rules

- Use Azure AI Search for retrieval.
- Use Blob Storage for source files and reference assets.
- Do not call Azure AI Search from the frontend.
- Do not call Azure AI Search directly from the Durable Functions orchestrator.
- Implement AI Search calls as activity functions.
- Preserve source metadata.
- Do not fabricate citations.
- Return retrieved context in a structured format.

## Recommended activity function

Use an activity function such as `retrieveContext`.

Input:

```json
{
  "query": "string",
  "intent": "string",
  "agentMode": "auto | furusato | disaster-simulation | disaster-learning",
  "topK": 5
}
```

Output:

```json
{
  "documents": [
    {
      "title": "string",
      "content": "string",
      "source": "string",
      "url": "string",
      "score": 0,
      "metadata": {}
    }
  ]
}
```

## Search behavior

- Use the user message as the base query.
- Use intent to choose filters or indexes when needed.
- Use topK to limit retrieved chunks.
- Prefer concise context over excessive context.
- Include document title, source, score, and URL if available.
- Return an empty document list when no useful context is found.

## Citation rules

- Preserve source metadata from Azure AI Search.
- Include citations only when retrieved documents support the answer.
- Do not create fake source names.
- Do not create fake URLs.
- If sources are unavailable, answer without citations and state that source documents were not available.

## Blob Storage usage

Use Blob Storage for:

- Original source documents
- Map assets
- Images
- Reference files
- Static disaster preparedness documents

When Blob Storage content is indexed by Azure AI Search, prefer retrieving through Azure AI Search instead of loading raw blobs directly.

## Safety and quality

- For disaster preparedness answers, prefer reliable and official documents when available.
- Avoid using low-confidence retrieval results as definitive guidance.
- If retrieved context conflicts, surface uncertainty.
- If the question asks for real-time disaster information, do not pretend the indexed data is real-time unless the system explicitly supports real-time updates.

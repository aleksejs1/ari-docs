---
title: AI Name Suggestions
sidebar_label: AI Suggestions
---

# AI Name Suggestions

Ari can automatically detect the language/locale of contact names and suggest transliterated alternatives. For example, if you have a name stored in Cyrillic ("Янис Берзиньш"), Ari can suggest the Latvian version ("Jānis Bērziņš") as a separate name entry.

## How It Works

1. When a `ContactName` is saved **without** a locale set, Ari dispatches a background job to analyze it.
2. The AI examines the name and detects its script (Cyrillic, Latin, etc.) and likely locale.
3. If a natural transliteration exists, a **suggestion** is created with status `pending`.
4. A sparkle icon (✨) appears next to the name on the contact details page.
5. You can **Accept** the suggestion (creates a new name entry with the alternative locale) or **Dismiss** it.

## Eligibility Rules

Not every name is analyzed — Ari skips names that:
- Already have a locale set
- Are shorter than 3 characters
- Contain digits or special characters
- Mix Cyrillic and Latin scripts in the same name

## Configuration

Add the following environment variables to enable AI suggestions:

```env
AI_API_KEY=sk-...         # Your API key (OpenAI, Anthropic, or compatible)
AI_PROVIDER=openai        # Provider: openai | anthropic | custom
AI_MODEL=gpt-4o-mini      # Model to use (optional, provider default is used if omitted)
AI_BASE_URL=              # Custom base URL for compatible APIs (e.g. Ollama, OpenRouter)
```

When `AI_API_KEY` is empty, the feature is silently disabled — no errors, no broken UI.

### Example: OpenAI

```env
AI_API_KEY=sk-proj-...
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```

### Example: Anthropic

```env
AI_API_KEY=sk-ant-...
AI_PROVIDER=anthropic
AI_MODEL=claude-haiku-4-5-20251001
```

### Example: Local Ollama

```env
AI_API_KEY=ollama
AI_PROVIDER=custom
AI_MODEL=llama3.2
AI_BASE_URL=http://localhost:11434/v1
```

## Running Batch Analysis

Navigate to **Settings → AI** to:
- View token usage statistics (prompt tokens, completion tokens, accepted/dismissed counts)
- Trigger analysis for **all** existing contact names that don't yet have a locale set

This is useful after first enabling the feature on an existing database.

## Data Privacy (GDPR)

When AI suggestions are enabled, contact names are sent to the configured AI provider. Before enabling, ensure this complies with your applicable data protection regulations and that you have the appropriate legal basis for processing personal data with a third-party service.

The Settings → AI page displays a GDPR disclaimer as a reminder.

## Supported Locales

The AI suggests locales from a fixed allowed list: `ru`, `lv`, `en`, `de`, `fr`, `lt`, `et`, `pl`, `uk`. Any locale outside this list returned by the AI is treated as an error and the suggestion is discarded.

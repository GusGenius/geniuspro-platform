# Visualizer ↔ GeniusPro Alignment

Corrections and requirements for the Visualizer project to work with GeniusPro progress updates.

---

## Critical fix: `stream` must be `false`

**Wrong (in your reference):**
```json
"stream": true
```

**Correct:**
```json
"stream": false
```

Progress updates only work when `stream: false`. With `stream: true`, the API uses a different path that does not emit progress events.

---

## Endpoint for API key auth

When using an API key (Bearer token), use the v1 endpoint:

```
POST {base}/v1/chat/completions
```

**Option A:** Set base to include v1:
```
GENIUSPRO_API_URL=https://api.geniuspro.io/v1
```
Then the client calls `{base}/chat/completions` → `https://api.geniuspro.io/v1/chat/completions`

**Option B:** Client accepts a full path or `useV1: true` and appends `/v1` when needed.

---

## Correct request body (for reference)

```json
{
  "model": "cat:gutter-custom-solution",
  "stream": false,
  "progress_updates": true,
  "debug_pipeline": true,
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Run gutter custom solution and return placement JSON." },
        { "type": "image_url", "image_url": { "url": "<imageUrl>" } }
      ]
    }
  ]
}
```

---

## Client (`lib/geniuspro-cat-progress-client.js`)

Ensure the client sends:

- `stream: false`
- `progress_updates: true`
- `Accept: "application/json, text/event-stream"` (so the API knows we accept SSE)

Our reference client (`geniuspro-platform/docs/geniuspro-cat-progress-client.ts`) already does this. If the Visualizer has a different client, update it to match.

---

## SSE event format (what GeniusPro sends)

```
data: {"type":"progress","step":0,"totalSteps":5,"stepName":"","message":"Your cat is running 5 kittens..."}

data: {"type":"progress","step":2,"totalSteps":5,"stepName":"Gutter Custom Solution","message":"Step 2 of 5: Segmenting gutters..."}

data: {"type":"complete","data":{...full chat completion response...}}

data: {"type":"error","message":"..."}
```

---

## Visualizer streaming route checklist

1. Call GeniusPro with `stream: false` and `progress_updates: true`
2. Use `https://api.geniuspro.io/v1/chat/completions` when using API key
3. Parse SSE `data:` lines; for `type: "progress"` call `send("progress", u)`
4. For `type: "complete"` send the `data` payload to the client
5. For `type: "error"` forward the error

---

## Summary of changes for Visualizer

| Item | Fix |
|------|-----|
| Request body | `stream: false` (not true) |
| API URL (API key) | `https://api.geniuspro.io/v1` as base, or full path `/v1/chat/completions` |
| Client | Use `geniuspro-cat-progress-client.ts` (or equivalent) that sends stream: false |

---

## Debug logs: verify Gemini instructions

When `debug_pipeline: true` is sent, the Image Gen step returns `_debug_logs` in its output. Use this to confirm Gemini is receiving your gutter prompts.

**Add this after receiving the response** (e.g. in your `onComplete` or `parseCompletionResponse` handler):

```javascript
// After you have the full response (data or result)
const debugSteps = result?.debugSteps ?? data?.debug?.pipeline_steps ?? [];
const imageGenStep = debugSteps.find(s => 
  String(s?.client_model ?? "").startsWith("image_gen")
);
const debugLogs = imageGenStep?.parsed_json?._debug_logs;
if (debugLogs) {
  console.log("[Gutter] Instructions sent to Gemini:", debugLogs);
  console.log("[Gutter] System prompt snippet:", debugLogs.systemInstructionsSnippet);
  console.log("[Gutter] User prompt snippet:", debugLogs.instructionsSnippet);
}
```

**What to check:**
- `systemInstructionsLength` > 0 — system prompt is set
- `instructionsLength` > 0 — user prompt is set
- `systemInstructionsSnippet` starts with "Role: Senior Hydrology" — correct gutter logic
- `instructionsSnippet` mentions "hybrid rainwater harvesting" — correct design specs

**Request:** Include `debug_pipeline: true` in the request body.

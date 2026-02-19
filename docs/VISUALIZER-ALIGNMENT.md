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

## GeniusPro response shape (gutter placement)

What the gutter system needs from GeniusPro to position gutters correctly.

### 1. `gutter_masks_base64` (required for drawing gutters)

| Property | Value |
|----------|-------|
| Type | Array of base64 PNG strings |
| Format | Each mask must be the same size as the source image (`image_width` × `image_height`) |
| Content | One mask per gutter run. White/alpha pixels along the gutter centerline; black/transparent elsewhere |
| Coordinate system | The app vectorizes each mask and treats the resulting points as normalized 0–1 image coordinates (origin top-left) |

### 2. `gutter_offsets` (paired with masks)

| Property | Value |
|----------|-------|
| Type | Array of `[x, y]`, normalized 0–1, one per mask |
| Pairing | `gutter_offsets[i]` must correspond to `gutter_masks_base64[i]` |
| For full-image masks | Use `[0, 0]` for each gutter. The mask already encodes position |
| Length | Must match `gutter_masks_base64.length` |

### 3. `rooflines` (used when masks are missing)

- If GeniusPro does not return masks, the app derives `gutter_offsets` from roofline centers
- **Issue:** Roofline centers are not gutter centerlines, so placement can be wrong
- **Improvement:** If GeniusPro returns `suggested_gutters` with `position: [x, y]` per gutter, the app should use those instead of roofline centers

### Recommended response shape (masks)

```json
{
  "image_width": 1264,
  "image_height": 848,
  "rooflines": [
    { "id": "roof_0", "points": [[x, y], ...] }
  ],
  "gutter_masks_base64": [
    "<base64 PNG, same size as image, white line on gutter run 1>",
    "<base64 PNG, same size as image, white line on gutter run 2>"
  ],
  "gutter_offsets": [
    [0, 0],
    [0, 0]
  ]
}
```

### Alternative: `suggested_gutters` (positions instead of masks)

```json
{
  "suggested_gutters": [
    {
      "roof_id": "roof_0",
      "position": [0.5, 0.32],
      "points": [[0.2, 0.35], [0.8, 0.30]]
    }
  ]
}
```

- `position` — center of the gutter run (normalized 0–1)
- `points` — polyline along the gutter centerline, normalized 0–1. If present, the app could draw gutters without masks

### Summary

| Need | Purpose |
|------|---------|
| `gutter_masks_base64` | PNG masks, image-sized, one per gutter run. White/alpha on the gutter line |
| `gutter_offsets` | `[0, 0]` per mask when masks are full-image; otherwise one `[x, y]` per mask |
| `image_width` / `image_height` | So masks and coordinates can be scaled correctly |
| `suggested_gutters[].position` (optional) | Better fallback than roofline centers when masks are missing |
| `suggested_gutters[].points` (optional) | Direct polyline for each gutter; would allow drawing without masks |

**Main requirement:** Full-image masks (same size as the source image) so the vectorized centerlines map directly to image coordinates.

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

---

## Implementation checklist (Visualizer)

| Change | Location | Status |
|--------|----------|--------|
| `debug_pipeline: true` | gutter-custom-solution route (line 93) | ✓ Set |
| `debug_pipeline: true` | geniuspro-cat-progress-client.js (line 59) | ✓ Set |
| Include `debugSteps` in result | app/api/gutter-custom-solution-stream/route.js | ✓ Result event now includes debugSteps from runCatWithProgress |
| Log gutter instructions | `components/full-ai-flow/screens/AIScreen5Generating.js` | ✓ Logging in streaming and non-streaming paths |

**When pipeline completes, filter console by `[Gutter]`:**

- `[Gutter] Instructions sent to Gemini:` — full _debug_logs object
- `[Gutter] System prompt snippet:` — systemInstructionsSnippet
- `[Gutter] User prompt snippet:` — instructionsSnippet

**What to verify:**

- `systemInstructionsLength` > 0
- `instructionsLength` > 0
- `systemInstructionsSnippet` starts with "Role: Senior Hydrology"
- `instructionsSnippet` mentions "hybrid rainwater harvesting"

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

## What the Visualizer needs from SAM 3 (or the pipeline)

Source image → SAM 3 segmentation → masks + structured data → Visualizer.

### 1. Gutter masks (`gutter_masks_base64`)

| Requirement | Details |
|-------------|---------|
| Format | Base64 PNG strings, one per gutter run |
| Dimensions | Same as source image (`image_width` × `image_height`) |
| Content | White/alpha pixels along the gutter centerline; black/transparent elsewhere |
| Shape | Linear runs (horizontal or vertical) that can be vectorized into a centerline |

### 2. Downspout masks (`downspout_masks_base64`)

| Requirement | Details |
|-------------|---------|
| Format | Base64 PNG strings, one per downspout |
| Dimensions | Same as source image |
| Content | White/alpha pixels along the downspout centerline; black/transparent elsewhere |
| Shape | Vertical lines (top to bottom) |

### 3. Rain chain placements (`suggested_rain_chains`)

| Requirement | Details |
|-------------|---------|
| Format | `{ position: [x, y], end_y?: number }` – normalized 0–1 |
| `position` | Top of rain chain (where it meets the gutter) |
| `end_y` | Bottom of chain (default: ground_level or tank top) |

Masks are optional; `position` + `end_y` is enough for drawing.

### 4. Tank detection (`suggested_tank`)

| Requirement | Details |
|-------------|---------|
| `position` | `[centerX, bottomY]` – normalized 0–1 |
| `bbox` | `[xMin, yMin, xMax, yMax]` – preferred for size/position |
| `size` | `[width, height]` – optional fallback |

### 5. Downspout placements (`suggested_downspouts`)

| Requirement | Details |
|-------------|---------|
| Format | `{ position: [x, y], end_y?: number, bbox?: [...], size?: [w, h] }` |
| `position` | Top of downspout (gutter connection) |
| `end_y` | Bottom (ground or tank) |
| `bbox` | Optional, for mask-free sizing |

### 6. Rooflines (`rooflines`)

| Requirement | Details |
|-------------|---------|
| Format | `{ id?, points: [[x, y], ...] }` – normalized 0–1 polygon |
| Use | Fallback for `gutter_offsets` when masks are missing |

### 7. Overlay image (`overlay_image_base64`) – optional

| Requirement | Details |
|-------------|---------|
| Format | Base64 PNG of the full visualization |
| Use | Background when "SAM On" is toggled (shows detection overlay) |

### 8. Metadata

| Field | Purpose |
|-------|---------|
| `image_width` | Coordinate scaling |
| `image_height` | Coordinate scaling |
| `ground_level` | Default 0.92 – bottom of image for downspouts/chains |

### Mask format summary

All masks must be:

- Same size as the source image
- PNG with alpha
- White/alpha on the detected region
- Black/transparent elsewhere

The app vectorizes masks into centerlines and draws along those paths. For gutters it expects horizontal/vertical runs; for downspouts it expects vertical runs.

### Pipeline flow

```
Source image → SAM 3 segmentation → masks + structured data
                    ↓
     gutter_masks_base64 (one per gutter run)
     downspout_masks_base64 (one per downspout)
     suggested_rain_chains (position + end_y)
     suggested_downspouts (position + end_y, optional bbox)
     suggested_tank (position + bbox)
     rooflines (polygons)
     overlay_image_base64 (optional full overlay)
```

### gutter_offsets (paired with gutter masks)

| Property | Value |
|----------|-------|
| Type | Array of `[x, y]`, normalized 0–1, one per mask |
| Pairing | `gutter_offsets[i]` must correspond to `gutter_masks_base64[i]` |
| For full-image masks | Use `[0, 0]` for each gutter |

### Example response shape

```json
{
  "image_width": 1264,
  "image_height": 848,
  "ground_level": 0.92,
  "rooflines": [
    { "id": "roof_0", "points": [[0.1, 0.2], [0.5, 0.15], [0.9, 0.2]] }
  ],
  "gutter_masks_base64": ["<base64 PNG per gutter run>"],
  "gutter_offsets": [[0, 0]],
  "downspout_masks_base64": ["<base64 PNG per downspout>"],
  "suggested_rain_chains": [{ "position": [0.5, 0.35], "end_y": 0.92 }],
  "suggested_downspouts": [{ "position": [0.5, 0.35], "end_y": 0.92 }],
  "suggested_tank": { "position": [0.5, 0.95], "bbox": [0.3, 0.85, 0.7, 0.95] },
  "overlay_image_base64": "<optional full visualization PNG>"
}
```

SAM 3 (or the pipeline) should produce these masks and structured fields so the Visualizer can place and draw gutters, downspouts, rain chains, and tank correctly.

---

## Overlay image (`overlay_image_base64`)

The app uses `overlay_image_base64` when "SAM On" is toggled to show the detection overlay. Two paths can supply it:

| Path | Returns overlay? | Notes |
|------|------------------|-------|
| **gutter-custom-solution** (CAT pipeline) | Yes | When `include_overlay_image: true` and input is PNG. The API passes it through. |
| **gutter-segment** (analyze-home-photo) | Yes | Passes through when upstream returns it. See app/api/gutter-segment/route.js. |

**GeniusPro (gutter-custom-solution):** Returns `overlay_image_base64` when the Gutter Custom Solution kitten has `include_overlay_image: true` (default) and the input image is PNG. The pipeline passes it through unchanged.

**Visualizer (gutter-segment route):** Passes through `overlay_image_base64`, masks, `suggested_downspouts`, `image_width`/`image_height`, and `gutter_offsets` from the upstream response.

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
| Pass through `overlay_image_base64` | app/api/gutter-segment/route.js | ✓ Done |
| Pass through masks from upstream | app/api/gutter-segment/route.js | ✓ Done |

**gutter-segment route (app/api/gutter-segment/route.js):** Forwards all placement-related fields from GeniusPro (analyze-home-photo) instead of overwriting with empty values. Passes through: `overlay_image_base64`, `gutter_masks_base64`, `downspout_masks_base64`, `rain_chain_masks_base64`, `suggested_downspouts`, `image_width`, `image_height`. Uses upstream `gutter_offsets` when present; otherwise `[0, 0]` per mask for full-image masks; otherwise roofline centers.

**When pipeline completes, filter console by `[Gutter]`:**

- `[Gutter] Instructions sent to Gemini:` — full _debug_logs object
- `[Gutter] System prompt snippet:` — systemInstructionsSnippet
- `[Gutter] User prompt snippet:` — instructionsSnippet

**What to verify:**

- `systemInstructionsLength` > 0
- `instructionsLength` > 0
- `systemInstructionsSnippet` starts with "Role: Senior Hydrology"
- `instructionsSnippet` mentions "hybrid rainwater harvesting"

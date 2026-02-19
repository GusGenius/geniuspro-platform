# Progress Updates — What the AI Should Look For

> **Purpose:** Instructions for AI assistants working on the GeniusPro platform. Use this when debugging, extending, or modifying the progress-update flow for cat runs (especially Gutter Custom Solution).

---

## Overview

The API sends **SSE (Server-Sent Events)** progress messages to the client during long-running cat pipeline steps. The client displays these in the Test Run panel so users see what’s happening (e.g. "Segmenting gutters...", "Computing placement heuristics...").

---

## Key Files to Inspect

### API (geniuspro-api)

| File | Purpose |
|------|---------|
| `lib/chat-completions/request-parser.ts` | Parses `progress_updates: true` from request body |
| `lib/chat-completions/core-executor.ts` | When `progressUpdatesRequested`, returns SSE stream instead of JSON; wires `onProgress` into `executeTypedKittens` |
| `lib/cat-kittens/execute.ts` | `executeTypedKittens` accepts `onProgress`; calls it at start of each step and passes it to sub-steps |
| `lib/gutter-custom-solution.ts` | `runGutterCustomSolution` accepts `onProgress`; emits messages at: SAM 3 run, mask fetch, heuristics, overlay render |
| `lib/replicate-sam3.ts` | `runReplicateSam3Pipeline` accepts `onProgress`; emits per-target (e.g. "Segmenting gutters...") |

### Platform (geniuspro-platform)

| File | Purpose |
|------|---------|
| `app/api/chat/completions/route.ts` | Proxy to API; forwards body; passes through `text/event-stream` responses |
| `components/cats/cat-runner.ts` | `runCatOnce` sends `progress_updates: true`; when response is SSE, uses `consumeProgressStream` and calls `onProgress` |
| `components/cats/test-run-panel.tsx` | Uses `progressUpdates: true` and `onProgress`; shows `progressMessage` while running |

---

## SSE Event Format

When `progress_updates: true` is sent:

| Event type | Payload | When |
|------------|---------|------|
| `progress` | `{ type: "progress", step, stepName, message }` | During each pipeline step |
| `complete` | `{ type: "complete", data: responseData }` | Final response (same shape as non-streaming) |
| `error` | `{ type: "error", message }` | On failure |

---

## Adding Progress to a New Step

1. **API:** In `execute.ts`, add `onProgress` call at the start of the step and pass it to any sub-calls (e.g. `runGutterCustomSolution`, `runReplicateSam3Pipeline`).
2. **Sub-modules:** Add optional `onProgress?: (message: string) => void` to long-running functions; call it at meaningful phases (e.g. before API calls, before heavy compute).
3. **Client:** No changes needed if `progressUpdates: true` is already sent; the client will receive and display updates.

---

## Debugging Checklist

- [ ] Request includes `progress_updates: true` in the body
- [ ] API returns `Content-Type: text/event-stream` (not `application/json`)
- [ ] Platform proxy forwards the stream (no buffering)
- [ ] `cat-runner` detects SSE via `content-type` and uses `consumeProgressStream`
- [ ] `onProgress` is passed from `runCatOnce` to `TestRunPanel`
- [ ] `progressMessage` state is shown in the UI while `testRunning` is true

---

## Grep Patterns

- `progress_updates` — request body
- `progressUpdatesRequested` — parsed flag
- `onProgress` — callback wiring
- `type: "progress"` — SSE event
- `consumeProgressStream` — client handling

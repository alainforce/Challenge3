# Hukuk Metre

Manifest V3 Chrome extension that analyzes Terms of Service, privacy policies, and subscription terms with Google Gemini. All user-facing report text is Turkish. Bu uygulama hukuki tavsiye vermez.

## Architecture

```text
page -> content script -> hidden/injection filter -> chunks -> service worker
     -> Gemini generateContent JSON -> Zod + quote verification -> score -> side panel
```

The extension uses Gemini REST only. The default model is `gemini-3.8-flash`; the options page allows any model name and suggests `gemini-3.8-flash-lite` as a fallback. The key is entered by the user and stored only in `chrome.storage.local`. It is never hardcoded, logged, put in a URL, or included in error messages.

## Setup

```bash
npm install
npm test
npm run build
```

Load `dist` from `chrome://extensions` with Developer mode enabled. Open Options, paste a Google AI Studio Gemini key, and choose a model. The request is sent to `https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent` using the `x-goog-api-key` header. Structured output uses `generationConfig.responseMimeType = application/json`, a simple Gemini-compatible `responseSchema`, and `temperature: 0`. The response is parsed and validated again with Zod; invalid output gets one retry, then an honest error.

## Quota and privacy

429 and 503 responses use exponential backoff for up to three transport attempts. Chunks are processed sequentially. Final reports are cached in `chrome.storage.local` by model + URL + page-text SHA-256 for 24 hours. The eval harness waits one second between documents.

Google's free tier may use submitted content to improve its products. Do not analyze private or sensitive documents with a free-tier key. Gemini rate limits vary by project, model, and account tier; check the active limits in Google AI Studio. The current ListModels/API check found `gemini-3.8-flash` available for `generateContent`; older `gemini-2.5-flash` was listed but rejected for this new-user key, so it is no longer the default.

## Security

Page text is untrusted data. Rules are in `systemInstruction`; page text is wrapped in explicit delimiters in the user content. Hidden elements (`display:none`, invisible/off-screen/tiny/same-color text, `aria-hidden`, scripts and templates) are excluded and reported. Injection-like phrases are flagged and cannot change the score. A clause without an exact normalized quote is never displayed. The score is recomputed from verified clauses and category weights; no model score is accepted.

The optional Page Agent adapter follows the documented `new PageAgent({ ... }).execute(task)` API. If used, configure it with the same Gemini key and Gemini's documented OpenAI-compatible base URL `https://generativelanguage.googleapis.com/v1beta/openai/`; the analyzer itself does not use Page Agent or its demo LLM.

## Eval and Cypress

`eval/sources` contains five real public-service text excerpts, source URLs, and hand-labelled quotes. `npm run eval` writes `eval/results.md`. This offline harness measures quote presence, not semantic model recall; its limitations are recorded honestly.

`npm run cypress:run` enables video recording. The Cypress suite installs a deterministic `cy.intercept` for the Gemini endpoint so it consumes no quota. The injection page is at `test/injection.html`.

## Official references

- [Gemini models](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Pricing and free-tier data use](https://ai.google.dev/gemini-api/docs/pricing)
- [OpenAI compatibility for the Page Agent adapter](https://ai.google.dev/gemini-api/docs/openai)

## Final verification notes

- Vitest: 8 tests passed. Coverage includes exact and normalized quote matching, fabricated-quote rejection, score recomputation while ignoring a model-provided score, hidden `display:none`/opacity/off-screen/`aria-hidden`/comment content, and injection phrase detection.
- Build and TypeScript checks passed with `npm run build` and `npx tsc --noEmit`.
- `test/injection.html` through the unit extraction pipeline produces `hiddenContentDetected: true` and `injectionDetected: true`; a short/non-legal page is rendered as `Belirsiz` and never receives a fabricated score.
- Cypress uses one spec with two scenes: a happy-path quote report and an injection/short-page warning report. The side panel is tested as the built page with `chrome.*` stubbed for deterministic isolation; Chromium launch also attempts `--load-extension=dist` when a Chrome-family browser is available. `video: true` is enabled and the two short scenes are intended to remain under 90 seconds total.
- A real Gemini eval was attempted for all five documents. `eval/raw/*.json` contains only model JSON or redacted-safe HTTP/error summaries, and `eval/results.md` includes per-document and overall metrics plus failure status. To run it locally: `GEMINI_API_KEY=<your-key> npm run eval`. The key is never written to raw output.
- Final model diagnosis: ListModels returned `models/gemini-2.5-flash` and `models/gemini-3.8-flash` as `generateContent` models, but a direct call rejected `gemini-2.5-flash` for this new-user key with `404 ... no longer available to new users`. The request URL was corrected/normalized to `.../models/gemini-3.8-flash:generateContent`. The rerun reached that URL; the key then received 503/429 quota/capacity responses, so the five raw files contain sanitized HTTP errors and the metrics mark those documents as failed operational misses.
- The real `test/injection.html` pipeline run reached the corrected Gemini URL but received HTTP 429 before a model report. Extraction still flagged `hiddenContentDetected: true` and `injectionDetected: true`; no score was produced or changed (`score: null`). Because the model response was unavailable, the run cannot honestly claim a rendered `Belirsiz` label; the deterministic short-text gate would return `Belirsiz` once a valid structured response is available.
- Repository and `dist/` scans found no API-key literal. `.env` is ignored by `.gitignore`; `.env.example` contains only a placeholder.

Assumptions: the user supplies a Gemini API key through the Options page for normal extension use; the eval runner may receive a temporary key through the process environment. Gemini free-tier limits are dynamic per project/model and must be checked in AI Studio. Short local excerpts in the mini eval can legitimately produce `Belirsiz`; they are not claims of legal correctness.

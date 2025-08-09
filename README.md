# llm-worker

A Cloudflare Worker that generates travel itineraries using an LLM API and stores job status/results in Firestore.

---

## Features

- Accepts POST requests with `destination` and `durationDays`
- Calls an LLM API to generate a travel itinerary
- Stores job status and results in Firestore (via REST API)
- Returns a job ID for tracking

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)
- Google Cloud project with Firestore enabled
- Service account with Firestore access (for REST API)
- LLM API credentials

---

## Setup

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd llm-worker/middle-worker
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

**Do NOT put secrets in `wrangler.toml`.**  
Instead, use Wrangler secrets for sensitive values.

#### Add non-secret variables to `wrangler.toml` `[vars]`:

```toml
[vars]
LLM_API_URL = "https://api.together.xyz/v1/chat/completions"
LLM_MODEL = "meta-llama/Llama-3-8b-chat-hf"
```

#### Add secrets using Wrangler CLI:

```sh
wrangler secret put LLM_API_KEY
wrangler secret put FIREBASE_API_KEY
wrangler secret put FIREBASE_AUTH_DOMAIN
wrangler secret put FIREBASE_PROJECT_ID
# If using a service account for Firestore REST API:
wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
```

---

## Running Locally

Cloudflare Workers run in a simulated environment locally.

```sh
wrangler dev
```

- The worker will be available at `http://localhost:8787/`
- Send a POST request to `/` with JSON body:
  ```json
  {
    "destination": "Paris, France",
    "durationDays": 3
  }
  ```

---

## Deploying to Cloudflare

Deploy your worker to Cloudflare's edge:

```sh
wrangler publish
```

- After deployment, your worker will be available at the URL shown in the output.

---

## Firestore Integration Notes

- This worker uses the Firestore REST API, not the Firebase JS SDK (which is not supported in Workers).
- You must provide a way to obtain an OAuth2 access token for Firestore REST API requests.  
  Typically, this is done using a Google service account JSON and JWT flow.
- Store your service account JSON as a Wrangler secret (`FIREBASE_SERVICE_ACCOUNT_JSON`) and implement token generation in your code.

---

## Project Structure

```
src/
  handlers/handler.ts      # Worker entry point
  services/service.ts      # Business logic
  repositories/llm_repo.ts # LLM API integration
  repositories/firestore_repo.ts # Firestore REST API integration
  utils/util.ts            # Utility functions
  domain/types/type.ts     # Type definitions
  bootstrap/firestore_bootstrap.ts # (If using SDK locally)
```

---

## Troubleshooting

- **Firestore errors:**  
  Ensure you are using the REST API and have valid credentials and project info.
- **Missing environment variables:**  
  Double-check all required secrets and vars are set via Wrangler.

---

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Firestore REST API](https://cloud.google.com/firestore/docs/reference/rest)
- [Google Service Account Auth](https://cloud.google.com/docs/authentication/production)

---

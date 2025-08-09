# llm-worker

A Cloudflare Worker that generates travel itineraries using an LLM API and stores job status/results in Firestore.

---
## Hi Selected.org !

- [this is a little message for you if you are comming from Selected.org](./report.md)


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
wrangler deploy
```

- After deployment, your worker will be available at the URL shown in the output.

---

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Firestore REST API](https://cloud.google.com/firestore/docs/reference/rest)
- [Google Service Account Auth](https://cloud.google.com/docs/authentication/production)

---

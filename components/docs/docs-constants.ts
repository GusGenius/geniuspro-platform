// Gateway (/v1) — lightweight models
export const API_BASE_URL_GATEWAY = "https://api.geniuspro.io/v1";
export const MODEL_CODER = "geniuspro-coder-v1";
export const MODEL_VOICE = "geniuspro-voice";

// Superintelligence — regular surface
export const API_BASE_URL_SUPERINTELLIGENCE = "https://api.geniuspro.io/superintelligence/v1";
export const MODEL_SUPERINTELLIGENCE = "gp-agi-1.2";

// Coding Superintelligence — Cursor surface
export const API_BASE_URL_CODING_SUPERINTELLIGENCE = "https://api.geniuspro.io/coding-superintelligence/v1";
export const MODEL_CODING_SUPERINTELLIGENCE = "gp-coding-agi-1.2";

export const AUTH_HEADER_EXAMPLE = "Authorization: Bearer YOUR_API_KEY";

export const CURL_SUPERINTELLIGENCE_EXAMPLE = `curl https://api.geniuspro.io/superintelligence/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${MODEL_SUPERINTELLIGENCE}",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`;

export const PYTHON_SUPERINTELLIGENCE_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.geniuspro.io/superintelligence/v1"
)

response = client.chat.completions.create(
    model="${MODEL_SUPERINTELLIGENCE}",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

print(response.choices[0].message.content)`;

export const JS_SUPERINTELLIGENCE_EXAMPLE = `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.geniuspro.io/superintelligence/v1",
});

const response = await openai.chat.completions.create({
  model: "${MODEL_SUPERINTELLIGENCE}",
  messages: [{ role: "user", content: "Explain quantum computing" }],
});

console.log(response.choices[0].message.content);`;

export const CURL_CODING_ONBOARDING_EXAMPLE = `curl https://api.geniuspro.io/coding-superintelligence/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": []
  }'`;

export const CURL_CODING_CHAT_EXAMPLE = `curl https://api.geniuspro.io/coding-superintelligence/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Help me add OAuth to my Next.js app"}
    ],
    "stream": true
  }'`;

export const CURL_CODING_SUMMARIZE_EXAMPLE = `curl https://api.geniuspro.io/coding-superintelligence/v1/summarize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "diff",
    "content": "PASTE YOUR DIFF HERE"
  }'`;

export const CURL_MEMORY_SAVE_SNIPPET_EXAMPLE = `curl https://api.geniuspro.io/coding-superintelligence/v1/memory/snippets \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "approved": true,
    "project_slug": "my-project",
    "language": "typescript",
    "tags": ["auth", "nextjs"],
    "content": "PASTE USER-APPROVED SNIPPET HERE"
  }'`;

export const CURL_MEMORY_LIST_SNIPPETS_EXAMPLE = `curl "https://api.geniuspro.io/coding-superintelligence/v1/memory/snippets?project_slug=my-project&limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;


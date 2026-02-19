// Primary API — unified OpenAI-compatible (geniuspro-api on Vercel)
export const API_BASE_URL = "https://api.geniuspro.io/v1";

// Recommended models (call GET /v1/models for full list)
export const MODEL_AGI = "geniuspro-agi-1.2";
export const MODEL_CODE_AGI = "geniuspro-code-agi-1.2";
export const MODEL_CLAUDE = "claude-sonnet-4.5";
export const MODEL_CLAUDE_OPUS = "claude-opus-4.6";
export const MODEL_GPT = "gpt-5.2";
export const MODEL_GPT_CODEX = "gpt-5.3-codex";
export const MODEL_GEMINI = "gemini-3-pro";
export const MODEL_DEEPSEEK = "deepseek-chat";
export const MODEL_MINIMAX = "minimax-m2.5";
export const MODEL_DEVSTRAL = "devstral-2";

// Coding Superintelligence — legacy (remote server, being phased out)
export const API_BASE_URL_CODING_SUPERINTELLIGENCE = "https://api.geniuspro.io/coding-superintelligence/v1";

// Vision Service — SAM 3 segmentation
export const API_BASE_URL_VISION = "https://api.geniuspro.io/vision/v1";
export const MODEL_VISION = "sam3";

export const AUTH_HEADER_EXAMPLE = "Authorization: Bearer YOUR_API_KEY";

export const CURL_SUPERINTELLIGENCE_EXAMPLE = `curl https://api.geniuspro.io/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${MODEL_AGI}",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`;

export const PYTHON_SUPERINTELLIGENCE_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.geniuspro.io/v1"
)

response = client.chat.completions.create(
    model="${MODEL_AGI}",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

print(response.choices[0].message.content)`;

export const JS_SUPERINTELLIGENCE_EXAMPLE = `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.geniuspro.io/v1",
});

const response = await openai.chat.completions.create({
  model: "${MODEL_AGI}",
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

export const CURL_VISION_SEGMENT_IMAGE_TEXT = `curl -X POST https://api.geniuspro.io/vision/v1/segment-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@image.jpg" \\
  -F "text_prompt=a red car"`;

export const CURL_VISION_SEGMENT_IMAGE_POINTS = `curl -X POST https://api.geniuspro.io/vision/v1/segment-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@image.jpg" \\
  -F "input_points=[[320,240]]" \\
  -F "input_labels=[1]"`;

export const CURL_VISION_SEGMENT_IMAGE_BOX = `curl -X POST https://api.geniuspro.io/vision/v1/segment-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@image.jpg" \\
  -F "input_box=[100,100,500,400]"`;

export const PYTHON_VISION_EXAMPLE = `import requests

url = "https://api.geniuspro.io/vision/v1/segment-image"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

with open("image.jpg", "rb") as f:
    files = {"image": f}
    data = {"text_prompt": "a red car"}
    response = requests.post(url, headers=headers, files=files, data=data)

result = response.json()
print(result["masks"])  # Segmentation masks
print(result["boxes"])  # Bounding boxes
print(result["scores"])  # Confidence scores`;

export const CURL_VISION_ANALYZE_HOME_PHOTO = `curl -X POST https://api.geniuspro.io/vision/v1/analyze-home-photo \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@home_photo.jpg"`;

export const PYTHON_VISION_ANALYZE_HOME_PHOTO = `import requests

url = "https://api.geniuspro.io/vision/v1/analyze-home-photo"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

with open("home_photo.jpg", "rb") as f:
    files = {"image": f}
    response = requests.post(url, headers=headers, files=files)

result = response.json()
print(result["rooflines"])  # Detected rooflines with points
print(result["suggested_rain_chains"])  # Rain chain positions
print(result["suggested_tank"])  # Tank position
print(result["ground_level"])  # Ground level Y coordinate`;

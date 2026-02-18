"use client";

export async function runCatOnce(args: {
  accessToken: string;
  catSlug: string;
  userMessage: string;
}): Promise<{ text: string }> {
  const message = args.userMessage.trim();
  if (!message) throw new Error("Enter something to test.");
  const model = `cat:${args.catSlug}`;

  const res = await fetch("https://api.geniuspro.io/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.accessToken}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Test run failed");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
  return { text };
}


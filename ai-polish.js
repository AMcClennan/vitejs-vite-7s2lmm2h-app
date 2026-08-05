// netlify/functions/ai-polish.js
// Proxies Anthropic API calls so the key never touches the browser.
// Deploy step: add ANTHROPIC_KEY to Netlify → Site settings → Environment variables

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const key = process.env.ANTHROPIC_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "NO_KEY", message: "ANTHROPIC_KEY environment variable is not set." })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return {
    statusCode: res.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

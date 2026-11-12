exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "ok" };
  }

  const h = event.headers || {};
  const relayKey = h["x-relay-key"] || h["X-Relay-Key"] || "";
  if (relayKey !== "Homs-Relay-2026-x7K9mP3qL8vR") {
    return { statusCode: 403, body: "forbidden" };
  }

  const auth = h["authorization"] || h["Authorization"] || "";
  if (!auth.startsWith("Bearer ")) {
    return { statusCode: 401, body: '{"error":"no_auth"}' };
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : (event.body || "");

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth,
        "User-Agent": "CalorieAdvisor/1.0"
      },
      body: body
    });

    return {
      statusCode: r.status,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": r.headers.get("retry-after") || "0"
      },
      body: await r.text()
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e).slice(0, 200) }) };
  }
};

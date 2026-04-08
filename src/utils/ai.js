export async function ai(sys, usr) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: sys,
      messages: [{ role: "user", content: usr }],
    }),
  });
  const d = await r.json();
  return d.content?.map((b) => b.text || "").join("") || "No response.";
}

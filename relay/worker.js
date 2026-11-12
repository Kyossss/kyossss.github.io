/*
 * Review relay — a Cloudflare Worker that sits between review.html and Discord.
 *
 * The Discord webhook URL lives ONLY in this Worker's secret settings
 * (env.DISCORD_WEBHOOK). It never appears in the website or this repo.
 *
 * Secrets to set in Cloudflare (Worker → Settings → Variables and Secrets,
 * type "Secret"):
 *   DISCORD_WEBHOOK   the Discord webhook URL
 *   TURNSTILE_SECRET  the Turnstile widget's secret key
 *
 * What it does with each request:
 *   1. Only accepts POST from the portfolio's own origin.
 *   2. Verifies the Turnstile token, so bots and scripts are rejected.
 *   3. Validates every field (types, lengths, allowed values).
 *   4. Builds the Discord embed itself, with mentions disabled, so nobody
 *      can make it post arbitrary text or ping @everyone.
 */

const ALLOWED_ORIGIN = "https://kyossss.github.io";
const ALLOWED_HOSTNAME = "kyossss.github.io";
const MAX_BODY_BYTES = 16 * 1024;

// Must match REVIEW.criteria ids in assets/js/data.js.
const CRITERIA = [
  { id: "communication", name: "Communication" },
  { id: "speed", name: "Speed" },
  { id: "results", name: "Results" },
  { id: "value", name: "Value" }
];
const SERVICES = ["Server optimisation", "Plugin development", "Maintenance and support", "Something else"];
const AGAIN = ["Yes", "Maybe", "No"];

// Best-effort per-IP throttle (per Worker instance). Turnstile is the real gate.
const recent = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    const reply = (status, error) =>
      new Response(JSON.stringify(error ? { ok: false, error } : { ok: true }), {
        status,
        headers: { ...cors, "Content-Type": "application/json" }
      });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, "method");
    if (origin !== ALLOWED_ORIGIN) return reply(403, "origin");
    if (!env.DISCORD_WEBHOOK || !env.TURNSTILE_SECRET) return reply(500, "not configured");

    const ip = request.headers.get("CF-Connecting-IP") || "";
    if (throttled(ip)) return reply(429, "slow down");

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return reply(413, "too large");

    let body;
    try { body = JSON.parse(raw); } catch { return reply(400, "bad json"); }
    if (!body || typeof body !== "object") return reply(400, "bad json");

    if (!(await turnstileOk(body.token, ip, env.TURNSTILE_SECRET))) return reply(403, "captcha");

    const d = validate(body.review);
    if (!d) return reply(400, "invalid review");

    const res = await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed(d))
    });
    if (!res.ok) return reply(502, "discord " + res.status);
    return reply(200);
  }
};

function throttled(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) { recent.set(ip, hits); return true; }
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

async function turnstileOk(token, ip, secret) {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const out = await r.json();
    return out.success === true && out.hostname === ALLOWED_HOSTNAME;
  } catch {
    return false;
  }
}

/* ---------- validation ---------- */

function str(v, max, required) {
  if (v == null) v = "";
  if (typeof v !== "string") return null;
  v = v.replace(/\s+/g, " ").trim();
  if (v.length > max) return null;
  if (required && !v) return null;
  return v;
}

function validate(r) {
  if (!r || typeof r !== "object") return null;

  const d = {
    name: str(r.name, 80, true),
    server: str(r.server, 80, true),
    discord: str(r.discord, 60, false),
    before: str(r.before, 600, true),
    after: str(r.after, 600, true),
    improve: str(r.improve, 600, false),
    again: str(r.again, 10, false),
    publish: r.publish === true,
    publishNumbers: r.publishNumbers === true,
    scores: {},
    services: [],
    metrics: []
  };
  for (const k of ["name", "server", "discord", "before", "after", "improve", "again"]) {
    if (d[k] === null) return null;
  }
  if (d.again && !AGAIN.includes(d.again)) return null;

  if (!r.scores || typeof r.scores !== "object") return null;
  for (const c of CRITERIA) {
    const n = r.scores[c.id];
    if (!Number.isInteger(n) || n < 1 || n > 5) return null;
    d.scores[c.id] = n;
  }

  if (!Array.isArray(r.services) || r.services.length > SERVICES.length) return null;
  for (const s of r.services) {
    if (!SERVICES.includes(s)) return null;
    if (!d.services.includes(s)) d.services.push(s);
  }

  if (r.metrics != null) {
    if (!Array.isArray(r.metrics) || r.metrics.length > 6) return null;
    for (const m of r.metrics) {
      if (!m || typeof m !== "object") return null;
      const row = { label: str(m.label, 48, true), before: str(m.before, 48, false), after: str(m.after, 48, false) };
      if (row.label === null || row.before === null || row.after === null) return null;
      if (!row.before && !row.after) return null;
      d.metrics.push(row);
    }
  }
  return d;
}

/* ---------- the Discord message ---------- */

// Neutralise markdown and mention forms so client text is shown as typed.
function md(s) {
  return String(s)
    .replace(/([*_`~|\\>])/g, "\\$1")
    .replace(/@/g, "@​")
    .replace(/</g, "<​");
}

function embed(d) {
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const avg = CRITERIA.reduce((s, c) => s + d.scores[c.id], 0) / CRITERIA.length;
  const fields = [];

  for (const c of CRITERIA) {
    fields.push({ name: c.name, value: stars(d.scores[c.id]) + "  " + d.scores[c.id] + "/5", inline: true });
  }
  fields.push({ name: "Hire again", value: d.again || "not answered", inline: true });
  fields.push({ name: "Work", value: d.services.length ? d.services.join(", ") : "not stated", inline: true });
  fields.push({ name: "Before", value: md(d.before).slice(0, 1024) });
  fields.push({ name: "After", value: md(d.after).slice(0, 1024) });
  if (d.improve) fields.push({ name: "To do better (private)", value: md(d.improve).slice(0, 1024) });

  if (d.metrics.length) {
    fields.push({
      name: "Numbers" + (d.publishNumbers ? "" : " — NOT cleared for publication"),
      value: d.metrics
        .map((m) => "• " + md(m.label) + ": " + md(m.before || "—") + " → " + md(m.after || "—"))
        .join("\n")
        .slice(0, 1024)
    });
  }

  fields.push({
    name: "Permission",
    value: d.publish
      ? "✅ CLEARED for publication (name + server + quote)" +
        (d.metrics.length ? (d.publishNumbers ? " + numbers" : ", numbers withheld") : "")
      : "🔒 PRIVATE — do not publish anything from this review"
  });
  if (d.discord) fields.push({ name: "Discord", value: md(d.discord), inline: true });

  return {
    username: "Kyoss — reviews",
    allowed_mentions: { parse: [] },
    embeds: [{
      title: (md(d.server) + " — " + avg.toFixed(1) + "/5").slice(0, 256),
      description: "Review from **" + md(d.name) + "**",
      color: d.publish ? 0xb794f6 : 0x847ca6,
      fields: fields.slice(0, 25),
      footer: { text: d.publish ? "Cleared to publish" : "Private feedback" },
      timestamp: new Date().toISOString()
    }]
  };
}

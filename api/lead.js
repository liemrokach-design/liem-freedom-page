/**
 * Serverless scaffold for receiving leads from the landing page form.
 *
 * Written for Vercel's Node function signature (module.exports with
 * (req, res)); porting to Netlify Functions / Cloudflare Workers /
 * a small Express app just means adapting the request/response glue
 * at the top and bottom of the handler — the validation, honeypot and
 * rate-limit logic in the middle is plain Node and stays as-is.
 *
 * NOT wired up by default. The frontend only calls this once you set
 * LEAD_ENDPOINT in js/config.js (e.g. "/api/lead" on Vercel). Before
 * flipping that on, connect a real destination below — right now a
 * valid lead is only console.logged, which is not durable storage.
 *
 * To forward leads somewhere real, set one of the env vars below and
 * fill in the matching TODO. Never hardcode credentials in this file.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

// In-memory store. Resets whenever the serverless instance recycles —
// fine as a first line of defense, but not a substitute for real rate
// limiting (e.g. Upstash Redis, Vercel Edge Config) in production.
const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function normalizePhone(value) {
  return String(value || "").replace(/[\s\-()]/g, "");
}

function isValidIsraeliPhone(value) {
  return /^(?:\+972|0)(?:[23489]\d{7}|5\d{8})$/.test(normalizePhone(value));
}

function validate(body) {
  const errors = {};
  const firstName = String(body.firstName || "").trim();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();

  if (!firstName) errors.firstName = "יש להזין שם פרטי.";
  if (!phone) errors.phone = "יש להזין מספר וואטסאפ.";
  else if (!isValidIsraeliPhone(phone)) errors.phone = "מספר הטלפון לא תקין.";
  if (!message) errors.message = "יש לכתוב כמה מילים על מה שאתה רוצה לשנות.";

  return { valid: Object.keys(errors).length === 0, errors, firstName, phone, message };
}

async function forwardLead(lead) {
  // TODO: pick one real destination and uncomment. Leave everything
  // else commented out — never call a service without a configured URL.

  // 1) Generic webhook (Slack/Zapier/Make/n8n/your own CRM intake URL):
  // if (process.env.LEAD_FORWARD_WEBHOOK_URL) {
  //   await fetch(process.env.LEAD_FORWARD_WEBHOOK_URL, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(lead),
  //   });
  // }

  // 2) Email via a transactional provider (Resend/Postmark/SendGrid),
  //    using that provider's SDK/HTTP API and an API key from env vars.

  // Until a destination is wired in, this is the only record of the lead.
  console.log("[lead]", JSON.stringify(lead));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    res.status(429).json({ ok: false, error: "Too many requests" });
    return;
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      res.status(400).json({ ok: false, error: "Invalid JSON" });
      return;
    }
  }

  // Honeypot: bots that fill hidden fields get a fake-success response
  // so they don't learn the field is a trap, but nothing is stored.
  if (body.nickname) {
    res.status(200).json({ ok: true });
    return;
  }

  const result = validate(body);
  if (!result.valid) {
    res.status(400).json({ ok: false, errors: result.errors });
    return;
  }

  try {
    await forwardLead({
      firstName: result.firstName,
      phone: result.phone,
      message: result.message,
      receivedAt: new Date().toISOString(),
      source: req.headers.referer || null,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[lead] forwarding failed", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
};

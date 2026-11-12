import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "20kb" }));
app.use("/api/", rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

app.post("/api/chat", async (req, res) => {
  const { message, language = "English", history = [] } = req.body || {};
  if (typeof message !== "string" || !message.trim() || message.length > 1200) {
    return res.status(400).json({ error: "Please send a message under 1200 characters." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI is not configured. Add OPENAI_API_KEY to .env." });
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const safeHistory = Array.isArray(history)
      ? history.slice(-8).filter(x => ["user", "assistant"].includes(x?.role) && typeof x?.content === "string")
          .map(x => ({ role: x.role, content: x.content.slice(0, 1200) }))
      : [];
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `You are the WENSA website assistant. Reply only in ${language}. Help visitors understand WENSA as a community initiative that promotes awareness, solidarity and support for people affected by cancer. You may explain the website, store navigation, product enquiries, volunteering/contact options and donation information that is explicitly present on the site. Do not invent prices, product availability, bank details, donation links, impact statistics, medical facts or promises. If asked for diagnosis, treatment, medication, prognosis or urgent health advice, kindly say you cannot provide medical advice and recommend speaking with a qualified healthcare professional or local emergency services if urgent. Do not collect sensitive medical or payment information. Keep replies warm, concise and accessible. If you do not know an official WENSA detail, say so and direct the visitor to the Contact page.`,
      input: [
        ...safeHistory,
        { role: "user", content: message.trim() }
      ]
    });
    res.json({ reply: response.output_text || "Sorry, I could not prepare an answer. Please contact the WENSA team." });
  } catch (error) {
    console.error("Chat API error:", error?.message || error);
    res.status(502).json({ error: "The assistant is temporarily unavailable. Please try again later." });
  }
});

/* ---------- ORDERS ---------- */
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
let queue = Promise.resolve();
const withLock = fn => { const run = queue.then(fn, fn); queue = run.catch(() => {}); return run; };
async function readOrders() {
  try { return JSON.parse(await fs.readFile(ORDERS_FILE, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return []; throw e; }
}
async function writeOrders(list) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(list, null, 2));
}
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const sha = v => crypto.createHash("sha256").update(String(v)).digest();
function adminOnly(req, res, next) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return res.status(503).json({ error: "Set ADMIN_PASSWORD in .env to read orders." });
  if (!crypto.timingSafeEqual(sha(req.get("x-admin-password") || ""), sha(pw))) return res.status(401).json({ error: "Wrong password." });
  next();
}


/* ---------- ORDER E-MAIL (Gmail) ---------- */
const mailer = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } })
  : null;
if (!mailer) console.warn("Gmail is not configured: orders are saved but no e-mail is sent. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.");
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dh = n => Number(n).toLocaleString("fr-FR") + " DH";
async function sendOrderEmail(order) {
  if (!mailer) return;
  const { customer: c, items } = order;
  const lines = items.map(i => `${i.qty} × ${i.name}${i.unit == null ? " (prix non défini)" : " — " + dh(i.unit * i.qty)}${i.custom ? "\n   ✎ " + i.custom : ""}`).join("\n");
  const text = `Nouvelle commande ${order.ref}\n\nClient : ${c.name}\nTéléphone : ${c.phone}\nVille : ${c.city}\nAdresse : ${c.address}\n\nArticles :\n${lines}\n\nTotal : ${dh(order.total)}${order.hasUnpricedItems ? " (+ articles sans prix)" : ""}\nLangue du client : ${order.lang || "—"}`;
  const rows = items.map(i => `<tr><td style="padding:8px 10px;border-bottom:1px solid #eadfc8">${i.qty} × <b>${esc(i.name)}</b>${i.custom ? `<br><i>✎ ${esc(i.custom)}</i>` : ""}</td><td style="padding:8px 10px;border-bottom:1px solid #eadfc8;text-align:right;white-space:nowrap">${i.unit == null ? "—" : dh(i.unit * i.qty)}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3a1a1f"><div style="background:#6b0f1f;color:#f7ecd2;padding:18px 22px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:2px">WENSA</div><div style="font-size:22px">Nouvelle commande</div><div style="font-size:13px;opacity:.85">${esc(order.ref)}</div></div><div style="background:#fbf5e6;padding:20px 22px;border-radius:0 0 12px 12px"><p style="margin:0 0 14px"><b>${esc(c.name)}</b><br>📞 <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a><br>${esc(c.city)} — ${esc(c.address)}</p><table style="width:100%;border-collapse:collapse;font-size:14px">${rows}<tr><td style="padding:12px 10px;font-size:16px"><b>Total</b></td><td style="padding:12px 10px;text-align:right;font-size:16px"><b>${dh(order.total)}</b></td></tr></table>${order.hasUnpricedItems ? '<p style="font-size:12px;color:#8a1b2c">Certains articles n’ont pas de prix : confirmez le total avec le client.</p>' : ""}<p style="font-size:12px;color:#7a6a58;margin-bottom:0">À faire : appeler le client pour confirmer la commande et la livraison.</p></div></div>`;
  await mailer.sendMail({
    from: `"WENSA Boutique" <${process.env.GMAIL_USER}>`,
    to: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
    subject: `Nouvelle commande ${order.ref} — ${dh(order.total)}`,
    text, html
  });
}

app.post("/api/orders", async (req, res) => {
  const b = req.body || {}, c = b.customer || {};
  const customer = { name: str(c.name, 100), phone: str(c.phone, 30), city: str(c.city, 80), address: str(c.address, 300) };
  if (!customer.name || !customer.city || !customer.address || !/^[+\d][\d\s().-]{7,29}$/.test(customer.phone))
    return res.status(400).json({ error: "Missing or invalid customer details." });
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 20)
    return res.status(400).json({ error: "Invalid cart." });
  const items = [];
  for (const i of b.items) {
    const qty = Number(i?.qty);
    const unit = i?.unit == null ? null : Number(i.unit);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99 || (unit !== null && (!Number.isFinite(unit) || unit < 0 || unit > 100000)))
      return res.status(400).json({ error: "Invalid item." });
    items.push({ productId: str(i.productId, 40), name: str(i.name, 120), unit, qty, custom: str(i.custom, 300) });
  }
  const total = items.reduce((s, i) => s + (i.unit == null ? 0 : i.unit * i.qty), 0);
  const ref = "WN-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
  const order = { ref, createdAt: new Date().toISOString(), status: "new", lang: str(b.lang, 5), customer, items, total, hasUnpricedItems: items.some(i => i.unit == null) };
  try {
    await withLock(async () => { const list = await readOrders(); list.unshift(order); await writeOrders(list); });
    try { await sendOrderEmail(order); } catch (mailError) { console.error("Order e-mail error:", mailError?.message || mailError); }
    res.status(201).json({ ref });
  } catch (error) {
    console.error("Order save error:", error?.message || error);
    res.status(500).json({ error: "Could not save the order." });
  }
});

app.get("/api/orders", adminOnly, async (req, res) => {
  try { res.json(await readOrders()); } catch { res.status(500).json({ error: "Could not read orders." }); }
});

app.patch("/api/orders/:ref", adminOnly, async (req, res) => {
  const status = req.body?.status;
  if (!["new", "confirmed", "delivered", "cancelled"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  try {
    const found = await withLock(async () => {
      const list = await readOrders(); const o = list.find(x => x.ref === req.params.ref);
      if (!o) return false; o.status = status; await writeOrders(list); return true;
    });
    found ? res.json({ ok: true }) : res.status(404).json({ error: "Order not found." });
  } catch { res.status(500).json({ error: "Could not update the order." }); }
});

/* never serve server code, secrets or order data as static files */
app.use((req, res, next) => /^\/(\.|_env|_gitignore|server\.js|package(-lock)?\.json|data(\/|$)|node_modules(\/|$))/i.test(req.path) ? res.status(404).end() : next());
app.use(express.static(__dirname));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.listen(PORT, () => console.log(`WENSA is running at http://localhost:${PORT}`));

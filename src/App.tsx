import { useState } from "react";

const C = {
  bg:      "#0a0a0a",
  surface: "#111",
  border:  "#1f1f1f",
  text:    "#ededed",
  muted:   "#555",
  dim:     "#2a2a2a",
  red:     "#ff3b3b",
  green:   "#00c96e",
  blue:    "#4f8ef7",
};

const mono = "'SF Mono','Fira Code','Cascadia Code',monospace";

const btn = (primary) => ({
  fontFamily: mono,
  fontWeight: 700,
  fontSize: 13,
  padding: "10px 22px",
  borderRadius: 6,
  cursor: "pointer",
  border: primary ? "none" : `1px solid ${C.border}`,
  background: primary ? C.red : "transparent",
  color: primary ? "#fff" : C.muted,
  transition: "opacity .15s",
});

function Nav({ tab, setTab }) {
  const tabs = ["Home", "Pricing", "Affiliates", "FAQ"];
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 15, color: C.text, marginRight: 40, padding: "15px 0", flexShrink: 0 }}>
          scamcheck<span style={{ color: C.red }}>.</span>
        </div>
        <div style={{ display: "flex", flex: 1 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: mono, background: "none", border: "none",
              borderBottom: `2px solid ${tab === t ? C.red : "transparent"}`,
              color: tab === t ? C.text : C.muted,
              fontWeight: tab === t ? 700 : 400,
              fontSize: 13, padding: "15px 16px",
              cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {t === "Affiliates" ? <span style={{ color: tab === t ? C.green : C.muted }}>✦ {t}</span> : t}
            </button>
          ))}
        </div>
        <button style={{ ...btn(true), padding: "8px 18px" }} onClick={() => setTab("Home")}>Try Free →</button>
      </div>
    </div>
  );
}

function Rule() {
  return <div style={{ borderTop: `1px solid ${C.border}` }} />;
}

// ── HOME ───────────────────────────────────────────────────────────────────
function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function check() {
    if (!text.trim() || loading) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: `You are a scam detection expert. Return ONLY a raw JSON object, no markdown:
{"verdict":"SCAM"|"SUSPICIOUS"|"LEGIT","score":<0-100>,"summary":"<one sentence>","flags":["<flag 1>","<flag 2>","<flag 3>"],"action":"<one clear next step>"}
SCAM=70-100. SUSPICIOUS=35-69. LEGIT=0-34. Keep flags under 12 words each. Be specific to the text.`,
          messages: [{ role: "user", content: `Analyze for scam indicators:\n\n${text}` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  }

  const examples = [
    { label: "IRS Text", text: "URGENT: Your IRS account has been suspended due to suspicious activity. Verify at irs-verify.net or face arrest. Call 1-800-555-0147 now." },
    { label: "Prize Email", text: "Congratulations! You've been selected to receive a $1,000 Amazon gift card. Claim within 24 hours before it expires." },
    { label: "Bank Alert", text: "Your Chase account is locked. Verify your identity by clicking below and entering your account details to restore access." },
    { label: "Job Offer", text: "Hi! We found your profile online. Remote job paying $800/week, no experience needed. Send $50 for your starter kit." },
  ];

  const vColor = result ? (result.verdict === "SCAM" ? C.red : result.verdict === "SUSPICIOUS" ? "#f5a623" : C.green) : C.muted;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px 100px" }}>

      {/* Hero */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>SCAM DETECTOR</div>
        <h1 style={{ fontFamily: mono, fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, color: C.text, letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 16px" }}>
          Is that message<br /><span style={{ color: C.red }}>a scam?</span>
        </h1>
        <p style={{ fontFamily: mono, fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}>
          Paste any suspicious text, email, or DM.<br />AI tells you in seconds. Free, no account needed.
        </p>
      </div>

      {/* Checker */}
      {!result ? (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginRight: 4 }}>TRY EXAMPLE:</span>
            {examples.map(e => (
              <button key={e.label} onClick={() => setText(e.text)} style={{ fontFamily: mono, fontSize: 10, padding: "3px 9px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                {e.label}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste suspicious message here..."
            style={{ width: "100%", minHeight: 160, padding: "16px", border: "none", background: "transparent", color: C.text, fontSize: 13, resize: "vertical", outline: "none", fontFamily: mono, lineHeight: 1.7, boxSizing: "border-box" }}
          />
          <Rule />
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{text.length} chars</span>
            <div style={{ display: "flex", gap: 8 }}>
              {text && <button onClick={() => setText("")} style={{ ...btn(false), padding: "8px 14px" }}>clear</button>}
              <button onClick={check} disabled={!text.trim() || loading} style={{ ...btn(true), opacity: text.trim() ? 1 : 0.35 }}>
                {loading ? "analyzing..." : "check →"}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontFamily: mono, fontSize: 12, color: C.red }}>{error}</div>}
        </div>
      ) : (
        <div style={{ border: `1px solid ${vColor}44`, borderRadius: 8, overflow: "hidden", background: C.surface }}>
          {/* Verdict header */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 6 }}>VERDICT</div>
              <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: vColor }}>{result.verdict === "SCAM" ? "🚨 " : result.verdict === "SUSPICIOUS" ? "⚠️ " : "✅ "}{result.verdict}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 6 }}>RISK SCORE</div>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: vColor }}>{result.score}<span style={{ fontSize: 13, color: C.muted }}>/100</span></div>
            </div>
          </div>

          {/* Score bar */}
          <div style={{ padding: "0 24px", height: 4, background: C.dim }}>
            <div style={{ height: "100%", width: `${result.score}%`, background: vColor, transition: "width 1s ease" }} />
          </div>

          {/* Summary */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{result.summary}</div>
          </div>

          {/* Flags */}
          {result.flags?.length > 0 && (
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 10 }}>FLAGS DETECTED</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.flags.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontFamily: mono, fontSize: 12, color: C.text }}>
                    <span style={{ color: vColor, flexShrink: 0 }}>→</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          {result.action && (
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 8 }}>WHAT TO DO</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: C.text, lineHeight: 1.7 }}>{result.action}</div>
            </div>
          )}

          <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
            <button onClick={() => { setResult(null); setText(""); }} style={{ ...btn(false), flex: 1 }}>← check another</button>
            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Verdict: ${result.verdict} (${result.score}/100) — checked with scamcheck.app 🚨`)}`, "_blank")} style={{ ...btn(false), flex: 1 }}>share on 𝕏</button>
          </div>
        </div>
      )}

      {/* Trust row */}
      <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        {["5 free checks/week", "no account needed", "results in 3 seconds", "10% fights fraud"].map(t => (
          <span key={t} style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── PRICING ────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      sub: "forever",
      color: C.muted,
      features: ["5 checks per week", "Resets every Monday", "Scam / Suspicious / Legit verdict", "Risk score 0–100", "No account needed"],
      cta: "Start free",
      primary: false,
    },
    {
      name: "Pro",
      price: "$3",
      sub: "per month",
      color: C.red,
      badge: "most popular",
      features: ["Unlimited checks", "Deep red flag analysis", "Actionable next steps", "Check history log", "Cancel anytime"],
      cta: "Get Pro →",
      primary: true,
    },
    {
      name: "Family",
      price: "$6",
      sub: "per month",
      color: C.green,
      features: ["Up to 5 members", "Everyone gets unlimited checks", "Shared check history", "Perfect for parents & seniors", "Cancel anytime"],
      cta: "Get Family →",
      primary: false,
    },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 100px" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 12 }}>PRICING</div>
        <h1 style={{ fontFamily: mono, fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: C.text, letterSpacing: -1, margin: "0 0 10px" }}>Simple pricing.</h1>
        <p style={{ fontFamily: mono, fontSize: 13, color: C.muted }}>Start free. Upgrade when you need more.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        {plans.map((p, i) => (
          <div key={p.name} style={{ background: C.surface, padding: "28px 24px", borderRight: i < 2 ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {p.badge && (
              <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.red, letterSpacing: 2, border: `1px solid ${C.red}33`, borderRadius: 4, padding: "2px 7px", display: "inline-block", marginBottom: 14 }}>{p.badge.toUpperCase()}</div>
            )}
            {!p.badge && <div style={{ height: 22, marginBottom: 14 }} />}
            <div style={{ fontFamily: mono, fontSize: 11, color: p.color, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>{p.name.toUpperCase()}</div>
            <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1 }}>{p.price}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 28, marginTop: 4 }}>{p.sub}</div>
            <Rule />
            <div style={{ marginTop: 20, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 10, fontFamily: mono, fontSize: 12, color: C.muted }}>
                  <span style={{ color: p.color, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button style={{ ...btn(p.primary), width: "100%", textAlign: "center" }}>{p.cta}</button>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div style={{ marginTop: 24, fontFamily: mono, fontSize: 12, color: C.muted, textAlign: "center" }}>
        Questions? Check the <span style={{ color: C.text, cursor: "pointer", textDecoration: "underline" }}>FAQ</span> or email us at hi@scamcheck.app
      </div>
    </div>
  );
}

// ── AFFILIATES ─────────────────────────────────────────────────────────────
function Affiliates() {
  const [refs, setRefs] = useState(25);
  const [copied, setCopied] = useState(false);
  const monthly = (refs * 3 * 0.3).toFixed(2);
  const yearly = (refs * 3 * 0.3 * 12).toFixed(0);
  function copy() { navigator.clipboard.writeText("scamcheck.app/?ref=yourname"); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px 100px" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 12 }}>AFFILIATE PROGRAM</div>
        <h1 style={{ fontFamily: mono, fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: C.text, letterSpacing: -1, margin: "0 0 12px" }}>
          Earn 30% recurring.<br /><span style={{ color: C.green }}>Forever.</span>
        </h1>
        <p style={{ fontFamily: mono, fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 440 }}>
          Share your link. Earn 30% of every Pro subscription — every month, as long as they stay subscribed. No approval. No minimums.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button style={{ ...btn(false), borderColor: C.green, color: C.green }}>Get my link →</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface, marginBottom: 24 }}>
        {[["30%", "commission"], ["90d", "cookie"], ["$20", "min payout"], ["∞", "no cap"]].map(([v, l], i) => (
          <div key={l} style={{ padding: "20px 16px", textAlign: "center", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: C.green }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface, marginBottom: 24 }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3 }}>HOW IT WORKS</div>
        </div>
        {[
          ["01", "Sign up free", "Get a unique referral link instantly. No approval, no waitlist."],
          ["02", "Share it anywhere", "Social media, email, your website, your newsletter — anywhere."],
          ["03", "Get paid monthly", "30% of every Pro subscription your link generates, every single month."],
        ].map(([n, title, desc], i) => (
          <div key={n}>
            {i > 0 && <Rule />}
            <div style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, paddingTop: 2, width: 20, flexShrink: 0 }}>{n}</div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
                <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface, marginBottom: 24 }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3 }}>YOUR LINK</div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ flex: 1, fontFamily: mono, fontSize: 13, color: C.green, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 14px", minWidth: 180 }}>
            scamcheck.app/?ref=yourname
          </code>
          <button onClick={copy} style={{ ...btn(false), borderColor: copied ? C.green : C.border, color: copied ? C.green : C.muted }}>
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      </div>

      {/* Calculator */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface, marginBottom: 24 }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3 }}>EARNINGS CALCULATOR</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{refs} referrals/mo</div>
        </div>
        <div style={{ padding: "20px" }}>
          <input type="range" min={1} max={500} value={refs} onChange={e => setRefs(+e.target.value)}
            style={{ width: "100%", accentColor: C.green, cursor: "pointer", marginBottom: 20, height: 3 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
            {[["REFERRALS", refs, "users/mo", C.text], ["MONTHLY", `$${monthly}`, "recurring", C.green], ["YEARLY", `$${Number(yearly).toLocaleString()}`, "passive", C.green]].map(([l, v, sub, col]) => (
              <div key={l} style={{ padding: "16px", textAlign: "center", background: C.bg, borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>{l}</div>
                <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, color: col }}>{v}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 10, textAlign: "center" }}>30% × $3/mo · recurring while subscribed</div>
        </div>
      </div>

      <button style={{ ...btn(false), borderColor: C.green, color: C.green, width: "100%", padding: "13px" }}>
        Join the affiliate program →
      </button>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      section: "Product",
      items: [
        { q: "How does ScamCheck work?", a: "You paste any suspicious message — text, email, DM — and our AI analyzes it against 50+ known scam patterns. You get a verdict (Scam / Suspicious / Legit), a risk score, and specific red flags detected from your message." },
        { q: "How accurate is it?", a: "Our model correctly identifies scams with over 94% accuracy based on internal testing across 50,000+ messages. It's not perfect — when in doubt, always verify through official channels." },
        { q: "Is my data private?", a: "Yes. We never store the content of messages you submit. Each check is processed in real time and discarded. We never sell your data." },
        { q: "What types of scams does it detect?", a: "IRS impersonation, bank phishing, romance scams, job fraud, package delivery scams, tech support scams, prize/lottery fraud, AI voice clone scripts, crypto investment scams, and more." },
      ],
    },
    {
      section: "Pricing & Billing",
      items: [
        { q: "What's included in the free plan?", a: "5 checks per week, resets every Monday. Basic verdict, risk score, and flagged red flags. No account required." },
        { q: "What's included in Pro?", a: "Unlimited checks, deep red flag analysis with specific explanations, actionable next steps, and full check history. $3/month, cancel anytime." },
        { q: "What's the Family plan?", a: "Up to 5 members, each with unlimited checks. Shared history so you can monitor what your family members are checking. $6/month." },
        { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments. Cancel from your account settings and you won't be charged again." },
        { q: "Do you offer refunds?", a: "Yes — if you're unsatisfied within the first 7 days of any paid plan, email hi@scamcheck.app for a full refund." },
      ],
    },
    {
      section: "Affiliate Program",
      items: [
        { q: "How much do affiliates earn?", a: "30% of every Pro subscription your referral link generates — recurring every month for as long as they stay subscribed. That's $0.90/month per user." },
        { q: "Is there an approval process?", a: "None. Sign up and start sharing in under a minute. No follower count, no website, no vetting." },
        { q: "How long does the affiliate cookie last?", a: "90 days. If someone clicks your link and subscribes anytime within 90 days, you earn the commission." },
        { q: "When and how do I get paid?", a: "Request a payout once your balance hits $20. We pay via PayPal or bank transfer, typically within 24 hours." },
      ],
    },
    {
      section: "Charity",
      items: [
        { q: "What's the 10% donation about?", a: "We donate 10% of every dollar we make to organizations actively fighting fraud — AARP Fraud Watch Network, FTC consumer education programs, and elder care fraud prevention." },
        { q: "How do I know the donations are real?", a: "We publish a monthly transparency report showing exactly how much was donated and to which organizations. Posted on our blog every first Monday." },
      ],
    },
  ];

  let globalIndex = 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px 100px" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 12 }}>FAQ</div>
        <h1 style={{ fontFamily: mono, fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: C.text, letterSpacing: -1, margin: "0 0 10px" }}>Common questions.</h1>
        <p style={{ fontFamily: mono, fontSize: 13, color: C.muted }}>Can't find what you need? Email hi@scamcheck.app</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {faqs.map(section => (
          <div key={section.section}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 10 }}>{section.section.toUpperCase()}</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface }}>
              {section.items.map((item, i) => {
                const idx = globalIndex++;
                return (
                  <div key={item.q}>
                    {i > 0 && <Rule />}
                    <div onClick={() => setOpen(open === idx ? null : idx)} style={{ cursor: "pointer" }}>
                      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.text }}>{item.q}</div>
                        <span style={{ color: C.muted, fontSize: 12, flexShrink: 0, transform: open === idx ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
                      </div>
                      {open === idx && (
                        <div style={{ padding: "0 20px 16px", fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Home");
  const pages = { Home: <Home />, Pricing: <Pricing />, Affiliates: <Affiliates />, FAQ: <FAQ /> };
  return (
    <div style={{ fontFamily: mono, background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } textarea::placeholder { color: #333; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #222; }`}</style>
      <Nav tab={tab} setTab={setTab} />
      <div key={tab}>{pages[tab]}</div>
    </div>
  );
}
import { useState, useRef } from "react";

const EXAMPLES: Record<string, string> = {
  "IRS Text": "URGENT: IRS Notice - Your tax return has been flagged for review. You owe $2,847 in back taxes. Failure to pay within 24 hours will result in arrest. Call 1-800-555-0192 immediately to avoid legal action. DO NOT IGNORE THIS MESSAGE.",
  "Prize Email": "Congratulations! You have been selected as the winner of our $1,000,000 sweepstakes! To claim your prize, please send us your full name, address, social security number, and a processing fee of $199 to prizes@lucky-winner-claim.net. This offer expires in 48 hours!",
  "Bank Alert": "Wells Farg0 Security Alert: Your account has been compromised. Click here to verify your identity immediately: http://wellsfargo-secure-login.xyz/verify. Enter your username, password and SSN to restore access.",
  "Job Offer": "Hi! I found your resume online. We're offering a $5,000/week work-from-home position, no experience needed! Just purchase our starter kit for $149 and you'll be earning within days. Reply with your personal info and we'll get you started right away!"
};

const RED = "#e53935";
const RED_DIM = "#5a1a1a";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#2a2a2a";
const MUTED = "#666";
const TEXT = "#ccc";
const FONT = "'Courier New', monospace";

function Nav({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  return (
    <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem", borderBottom:`1px solid ${BORDER}`, height:56, background:BG, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:"2.5rem" }}>
        <span onClick={() => setPage("home")} style={{ fontFamily:"system-ui,sans-serif", fontWeight:700, fontSize:18, cursor:"pointer", color:"#fff" }}>
          scamcheck<span style={{ color:RED }}>.</span>
        </span>
        {([["home","Home"],["pricing","Pricing"],["affiliates","+ Affiliates"],["faq","FAQ"]] as [string,string][]).map(([id,label]) => (
          <span key={id} onClick={() => setPage(id)} style={{ fontSize:14, color: page===id ? "#fff" : MUTED, cursor:"pointer", borderBottom: page===id ? `2px solid ${RED}` : "none", paddingBottom: page===id ? 2 : 0 }}>
            {label}
          </span>
        ))}
      </div>
      <button onClick={() => setPage("pricing")} style={{ background:RED, color:"#fff", border:"none", borderRadius:6, padding:"8px 20px", fontFamily:FONT, fontSize:13, cursor:"pointer", fontWeight:600 }}>
        Try Free →
      </button>
    </nav>
  );
}

function HomePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are a scam detection expert. Respond ONLY with valid JSON, no markdown:
{"verdict":"SCAM"|"LIKELY SCAM"|"SUSPICIOUS"|"LIKELY SAFE"|"SAFE","confidence":0-100,"summary":"1-2 sentences","red_flags":["..."],"advice":"one sentence"}`,
          messages:[{ role:"user", content:`Analyze for scam indicators:\n\n${text}` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setResult({ verdict:"ERROR", summary:"Could not analyze. Please try again.", red_flags:[], advice:"", confidence:0 }); }
    setLoading(false);
  };

  const vc = (v: string) => ({ SCAM:"#e53935","LIKELY SCAM":"#ef6c00",SUSPICIOUS:"#f9a825","LIKELY SAFE":"#43a047",SAFE:"#2e7d32" }[v] || "#888");
  const vbg = (v: string) => ({ SCAM:"#1a0000","LIKELY SCAM":"#1a0800",SUSPICIOUS:"#1a1400","LIKELY SAFE":"#001a04",SAFE:"#001a04" }[v] || "#1a1a1a");

  return (
    <div>
      <div style={{ textAlign:"center", padding:"3.5rem 1rem 2rem" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:MUTED, marginBottom:"1.5rem" }}>SCAM DETECTOR</div>
        <h1 style={{ fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, margin:0, lineHeight:1.15, color:"#fff" }}>
          Is that message<br /><span style={{ color:RED }}>a scam?</span>
        </h1>
        <p style={{ color:MUTED, fontSize:14, marginTop:"1.2rem", lineHeight:1.8 }}>
          Paste any suspicious text, email, or DM.<br />AI tells you in seconds. Free, no account needed.
        </p>
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 1.5rem 3rem" }}>
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", borderBottom:`1px solid #1e1e1e`, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:"#555", letterSpacing:1, marginRight:4 }}>TRY EXAMPLE:</span>
            {Object.keys(EXAMPLES).map(label => (
              <button key={label} onClick={() => { setText(EXAMPLES[label]); setResult(null); textareaRef.current?.focus(); }}
                style={{ background:"transparent", border:`1px solid #333`, color:"#aaa", borderRadius:4, padding:"3px 10px", fontSize:12, cursor:"pointer", fontFamily:FONT }}>
                {label}
              </button>
            ))}
          </div>
          <textarea ref={textareaRef} value={text} onChange={e => { setText(e.target.value); setResult(null); }}
            placeholder="Paste suspicious message here..."
            style={{ width:"100%", minHeight:180, background:"transparent", border:"none", outline:"none", color:TEXT, fontSize:14, fontFamily:FONT, padding:16, resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderTop:`1px solid #1e1e1e` }}>
            <span style={{ fontSize:12, color:"#555" }}>{text.length} chars</span>
            <button onClick={analyze} disabled={loading || !text.trim()}
              style={{ background: loading||!text.trim() ? RED_DIM : RED, color: loading||!text.trim() ? "#888" : "#fff", border:"none", borderRadius:6, padding:"9px 22px", fontFamily:FONT, fontSize:13, cursor: loading||!text.trim() ? "not-allowed":"pointer", fontWeight:600 }}>
              {loading ? "analyzing..." : "check →"}
            </button>
          </div>
        </div>
        {loading && <div style={{ textAlign:"center", padding:"2.5rem 0", color:"#555", fontSize:13, letterSpacing:2 }}>SCANNING MESSAGE...</div>}
        {result && !loading && (
          <div style={{ marginTop:"1.5rem", background:vbg(result.verdict), border:`1px solid ${vc(result.verdict)}44`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:`1px solid ${vc(result.verdict)}22` }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:3, color:"#555", marginBottom:6 }}>VERDICT</div>
                <div style={{ fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:700, color:vc(result.verdict), letterSpacing:1 }}>{result.verdict}</div>
              </div>
              {result.confidence > 0 && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, letterSpacing:2, color:"#555", marginBottom:4 }}>CONFIDENCE</div>
                  <div style={{ fontSize:28, fontWeight:700, color:vc(result.verdict) }}>{result.confidence}%</div>
                </div>
              )}
            </div>
            <div style={{ padding:"16px 24px", borderBottom:`1px solid #1e1e1e` }}>
              <p style={{ margin:0, fontSize:14, color:TEXT, lineHeight:1.7 }}>{result.summary}</p>
            </div>
            {result.red_flags?.length > 0 && (
              <div style={{ padding:"16px 24px", borderBottom:`1px solid #1e1e1e` }}>
                <div style={{ fontSize:11, letterSpacing:2, color:"#555", marginBottom:10 }}>RED FLAGS</div>
                {result.red_flags.map((flag: string, i: number) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                    <span style={{ color:RED, marginTop:2, fontSize:12 }}>▸</span>
                    <span style={{ fontSize:13, color:"#bbb", lineHeight:1.6 }}>{flag}</span>
                  </div>
                ))}
              </div>
            )}
            {result.advice && (
              <div style={{ padding:"14px 24px" }}>
                <div style={{ fontSize:11, letterSpacing:2, color:"#555", marginBottom:6 }}>ADVICE</div>
                <p style={{ margin:0, fontSize:13, color:"#aaa", lineHeight:1.6 }}>{result.advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name:"Free", price:0, desc:"For casual users who need occasional checks", color:"#333", features:["3 scans per week","Basic scam verdict","Red flag breakdown","No account needed"], cta:"Get Started Free", highlight:false },
    { name:"Pro", price: annual ? 4 : 5, desc:"Unlimited protection for one person", color:RED, features:["Unlimited scans","Priority AI analysis","Detailed threat reports","Email & SMS scan support","Scan history (30 days)"], cta:"Start Pro →", highlight:true },
    { name:"Family", price: annual ? 12 : 15, desc:"Protect up to 5 family members", color:"#1565c0", features:["Everything in Pro","Up to 5 accounts","Family dashboard","Shared scan history","Priority support"], cta:"Start Family Plan →", highlight:false },
  ];
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"4rem 1.5rem" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:MUTED, marginBottom:"1rem" }}>PRICING</div>
        <h1 style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:700, color:"#fff", margin:0 }}>Simple, transparent pricing</h1>
        <p style={{ color:MUTED, fontSize:14, marginTop:"0.8rem" }}>No hidden fees. Cancel anytime.</p>
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginTop:"1.5rem", background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"6px 12px" }}>
          <span style={{ fontSize:13, color: annual ? MUTED : "#fff", cursor:"pointer" }} onClick={() => setAnnual(false)}>Monthly</span>
          <div onClick={() => setAnnual(a => !a)} style={{ width:40, height:22, background: annual ? RED : "#333", borderRadius:11, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
            <div style={{ position:"absolute", top:3, left: annual ? 21 : 3, width:16, height:16, background:"#fff", borderRadius:"50%", transition:"left 0.2s" }} />
          </div>
          <span style={{ fontSize:13, color: annual ? "#fff" : MUTED, cursor:"pointer" }} onClick={() => setAnnual(true)}>Annual <span style={{ color:"#43a047", fontSize:11 }}>save 20%</span></span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
        {plans.map(p => (
          <div key={p.name} style={{ background: p.highlight ? "#1a0000" : CARD, border:`1px solid ${p.highlight ? RED+"66" : BORDER}`, borderRadius:12, padding:"1.75rem", display:"flex", flexDirection:"column" }}>
            {p.highlight && <div style={{ background:RED, color:"#fff", fontSize:11, letterSpacing:2, textAlign:"center", borderRadius:4, padding:"3px 10px", marginBottom:16, alignSelf:"flex-start" }}>MOST POPULAR</div>}
            <div style={{ fontSize:11, letterSpacing:3, color:p.color, marginBottom:8 }}>{p.name.toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
              <span style={{ fontSize:36, fontWeight:700, color:"#fff" }}>{p.price === 0 ? "Free" : `$${p.price}`}</span>
              {p.price > 0 && <span style={{ color:MUTED, fontSize:13 }}>/mo</span>}
            </div>
            <p style={{ color:MUTED, fontSize:13, marginBottom:"1.5rem", lineHeight:1.6 }}>{p.desc}</p>
            <div style={{ flex:1 }}>
              {p.features.map(f => (
                <div key={f} style={{ display:"flex", gap:8, marginBottom:10, fontSize:13, color:TEXT, alignItems:"flex-start" }}>
                  <span style={{ color: p.highlight ? RED : "#43a047", marginTop:1 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button style={{ marginTop:"1.5rem", background: p.highlight ? RED : "transparent", color: p.highlight ? "#fff" : TEXT, border:`1px solid ${p.highlight ? RED : BORDER}`, borderRadius:6, padding:"10px 0", width:"100%", fontFamily:FONT, fontSize:13, cursor:"pointer", fontWeight:600 }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:"3rem", color:MUTED, fontSize:13 }}>
        All plans include end-to-end encrypted analysis. Your messages are never stored.
      </div>
    </div>
  );
}

function AffiliatesPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const refCode = "DEMO-XK9F2";
  const stats = [{ label:"Commission Rate", val:"20%" }, { label:"Cookie Duration", val:"90 days" }, { label:"Payout Threshold", val:"$25" }, { label:"Payout Schedule", val:"Monthly" }];
  const steps = [
    { n:"01", title:"Sign up free", desc:"Create your affiliate account in under 2 minutes. No approval wait time." },
    { n:"02", title:"Get your link", desc:"You'll get a unique referral link to share anywhere — social, email, blog, wherever." },
    { n:"03", title:"Earn 20% forever", desc:"When someone subscribes through your link, you earn 20% of every payment they ever make. Recurring, forever." },
  ];
  const copyCode = () => { navigator.clipboard?.writeText(`https://scamcheck.store?ref=${refCode}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"4rem 1.5rem" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:MUTED, marginBottom:"1rem" }}>AFFILIATE PROGRAM</div>
        <h1 style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:700, color:"#fff", margin:0 }}>
          Earn <span style={{ color:RED }}>20%</span> recurring commission
        </h1>
        <p style={{ color:MUTED, fontSize:14, marginTop:"0.8rem", lineHeight:1.8 }}>
          Refer anyone to ScamCheck. Every time they pay — you get paid.<br />No cap. No expiry. Forever.
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"3rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:"1.2rem", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:RED, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:11, color:MUTED, letterSpacing:1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom:"3rem" }}>
        <div style={{ fontSize:11, letterSpacing:3, color:MUTED, marginBottom:"1.5rem" }}>HOW IT WORKS</div>
        {steps.map((s,i) => (
          <div key={i} style={{ display:"flex", gap:20, marginBottom:24 }}>
            <div style={{ fontSize:28, fontWeight:700, color:"#2a2a2a", minWidth:42, fontFamily:FONT }}>{s.n}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"#0d1a0d", border:`1px solid #1a3a1a`, borderRadius:10, padding:"1.5rem", marginBottom:"3rem" }}>
        <div style={{ fontSize:11, letterSpacing:3, color:"#43a047", marginBottom:12 }}>YOUR REFERRAL LINK (DEMO)</div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, background:"#0a0a0a", border:`1px solid ${BORDER}`, borderRadius:6, padding:"10px 14px", fontSize:13, color:TEXT, fontFamily:FONT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            https://scamcheck.store?ref={refCode}
          </div>
          <button onClick={copyCode} style={{ background: copied ? "#43a047" : "transparent", color: copied ? "#fff" : TEXT, border:`1px solid ${BORDER}`, borderRadius:6, padding:"10px 16px", fontFamily:FONT, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <div style={{ fontSize:12, color:MUTED, marginTop:10 }}>Demo only — sign up below to get your real link and start earning.</div>
      </div>
      {!submitted ? (
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:"2rem" }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6 }}>Join the affiliate program</div>
          <div style={{ fontSize:13, color:MUTED, marginBottom:"1.5rem" }}>Free to join. Start earning immediately after signup.</div>
          <div style={{ display:"flex", gap:10 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              style={{ flex:1, background:"#0a0a0a", border:`1px solid ${BORDER}`, borderRadius:6, padding:"10px 14px", color:"#fff", fontFamily:FONT, fontSize:13, outline:"none" }} />
            <button onClick={() => { if(email.includes("@")) setSubmitted(true); }}
              style={{ background:RED, color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontFamily:FONT, fontSize:13, cursor:"pointer", fontWeight:600 }}>
              Apply Now →
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background:"#0d1a0d", border:`1px solid #2a4a2a`, borderRadius:10, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:8 }}>🎉</div>
          <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6 }}>You're on the list!</div>
          <div style={{ fontSize:13, color:MUTED }}>We'll email you at <strong style={{ color:TEXT }}>{email}</strong> with your referral link within 24 hours.</div>
        </div>
      )}
    </div>
  );
}

function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q:"How does ScamCheck work?", a:"You paste any suspicious message into ScamCheck and our AI analyzes it for known scam patterns, suspicious language, urgency tactics, phishing indicators, and more. You get a verdict in seconds." },
    { q:"Is my data private? Are my messages stored?", a:"No. Your messages are analyzed in real time and never stored on our servers. We take privacy seriously — your conversations are end-to-end encrypted during analysis and immediately discarded." },
    { q:"What's the difference between the plans?", a:"The Free plan gives you 3 scans per week with no account needed. Pro ($5/mo) gives one person unlimited scans, detailed threat reports, and scan history. Family ($15/mo) extends Pro to up to 5 accounts with a shared dashboard." },
    { q:"Can I cancel my subscription anytime?", a:"Yes. No questions asked. You can cancel from your account settings at any time and you won't be charged again. You keep access until the end of your billing period." },
    { q:"What types of scams can ScamCheck detect?", a:"ScamCheck detects phishing emails, IRS/government impersonation scams, fake prize winnings, job offer scams, bank fraud texts, romance scams, investment fraud, and many more." },
    { q:"How does the affiliate program work?", a:"Sign up for free, get a unique referral link, and share it. Every time someone subscribes to a paid plan through your link, you earn 20% of every payment they make — recurring, forever, no cap." },
    { q:"When and how do affiliates get paid?", a:"Payouts happen monthly once you hit the $25 minimum threshold. We pay via PayPal or bank transfer. You can track your referrals and earnings in your affiliate dashboard." },
    { q:"Does the Family plan mean 5 separate accounts?", a:"Yes — the Family plan includes up to 5 individual accounts, each with their own login and unlimited scans. One family admin can manage all accounts from a shared dashboard." },
  ];
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"4rem 1.5rem" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:MUTED, marginBottom:"1rem" }}>FAQ</div>
        <h1 style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:700, color:"#fff", margin:0 }}>Frequently asked questions</h1>
        <p style={{ color:MUTED, fontSize:14, marginTop:"0.8rem" }}>Everything you need to know about ScamCheck.</p>
      </div>
      <div>
        {faqs.map((f,i) => (
          <div key={i} style={{ borderBottom:`1px solid ${BORDER}` }}>
            <div onClick={() => setOpen(open === i ? null : i)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.2rem 0", cursor:"pointer" }}>
              <span style={{ fontSize:14, color: open===i ? "#fff" : TEXT, fontWeight: open===i ? 600 : 400 }}>{f.q}</span>
              <span style={{ color:RED, fontSize:18, lineHeight:1, marginLeft:16, display:"inline-block", transform: open===i ? "rotate(45deg)" : "rotate(0)", transition:"transform 0.2s" }}>+</span>
            </div>
            {open === i && <div style={{ paddingBottom:"1.2rem" }}><p style={{ margin:0, fontSize:13, color:MUTED, lineHeight:1.8 }}>{f.a}</p></div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:"3rem", background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:"2rem" }}>
        <div style={{ fontSize:14, color:"#fff", fontWeight:600, marginBottom:6 }}>Still have questions?</div>
        <p style={{ fontSize:13, color:MUTED, margin:"0 0 1rem" }}>We're happy to help. Reach out anytime.</p>
        <button style={{ background:RED, color:"#fff", border:"none", borderRadius:6, padding:"9px 22px", fontFamily:FONT, fontSize:13, cursor:"pointer", fontWeight:600 }}>
          Contact Support →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={{ background:BG, minHeight:"100vh", color:"#fff", fontFamily:FONT }}>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <HomePage />}
      {page === "pricing" && <PricingPage />}
      {page === "affiliates" && <AffiliatesPage />}
      {page === "faq" && <FAQPage />}
    </div>
  );
}

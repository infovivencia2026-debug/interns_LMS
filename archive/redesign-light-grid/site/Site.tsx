import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Instagram, Linkedin, Mail, Plus, X, Youtube } from "lucide-react";
import SEO from "@/components/seo/SEO";
import { glydiSaveLead } from "@/pages/glydi/chrome";
import "./site.css";

/* ------------------------------------------------------------------ leads */

const WHATSAPP = "https://wa.me/918121306701";

/** A stable id per form, so a retried submission is deduplicated by the CRM. */
function useSubmissionId() {
  const id = useRef<string | null>(null);
  return {
    get: () => (id.current ??= crypto.randomUUID?.() ?? `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`),
    reset: () => { id.current = null; },
  };
}

export function useLeadForm() {
  const submissionId = useSubmissionId();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  async function save(body: Record<string, unknown>, failure = "We couldn’t save that just now. Please try again.") {
    if (state === "saving") return false;
    setError(null); setState("saving");
    const { saved, invalid } = await glydiSaveLead({ ...body, submissionId: submissionId.get() });
    if (!saved) { setState("idle"); setError(invalid || failure); return false; }
    submissionId.reset(); setState("saved");
    return true;
  }
  return { state, error, save, reset: () => setState("idle") };
}

export function openWhatsApp(lines: string[]) {
  window.open(`${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
}

/* ------------------------------------------------------------- Apply dialog */

const APPLY_EVENT = "onrol:apply";

/** Opens the Apply dialog from anywhere (the navbar dispatches the same event). */
export function openApply() { window.dispatchEvent(new CustomEvent(APPLY_EVENT, { cancelable: true })); }

export function ApplyButton({ children = "Apply now", className = "lg-btn" }: { children?: ReactNode; className?: string }) {
  return <button type="button" className={className} onClick={openApply}>{children} <ArrowRight size={17} /></button>;
}

function ApplyDialog() {
  const [open, setOpen] = useState(false);
  const lead = useLeadForm();
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onApply = (event: Event) => { event.preventDefault(); lead.reset(); setOpen(true); };
    window.addEventListener(APPLY_EVENT, onApply);
    return () => window.removeEventListener(APPLY_EVENT, onApply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    first.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = ""; document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open]);
  if (!open) return null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const v = new FormData(form);
    const name = String(v.get("name")).trim(), email = String(v.get("email")).trim(), phone = String(v.get("phone")).trim();
    if (await lead.save({ name, email, phone, source: "Apply modal", campaign: "apply" }, "We couldn’t save your application just now. Please try again.")) {
      openWhatsApp(["Hi ONROL, I’d like to apply for the next cohort.", "", `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`]);
      form.reset();
    }
  }
  return <div className="lg-modal" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
    <div className="lg-card" role="dialog" aria-modal="true" aria-labelledby="lg-apply-title">
      <button className="lg-close" type="button" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button>
      <span className="lg-label">Apply to ONROL</span>
      <h3 id="lg-apply-title">Start with a quick hello.</h3>
      <p className="mute">Leave your details and our team reaches out about the next cohort.</p>
      <div className="lg-steps"><span>20 seconds</span><span>No payment</span><span>We call you back</span></div>
      {lead.state === "saved"
        ? <p className="lg-form-ok" role="status"><Check size={18} /> Thanks, you’re in. WhatsApp has opened with your details so you can say hello.</p>
        : <form className="lg-form" onSubmit={submit}>
            <label>Full name<input ref={first} name="name" required maxLength={100} autoComplete="name" placeholder="Your name" /></label>
            <label>Email<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@email.com" /></label>
            <label>Phone / WhatsApp<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" /></label>
            {lead.error && <p className="lg-form-error" role="alert">{lead.error}</p>}
            <button className="lg-btn orange" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Saving…" : "Apply now"}</button>
            <p className="lg-form-note">No spam. We’ll only contact you about your application.</p>
          </form>}
    </div>
  </div>;
}

/* ------------------------------------------------------------------ motif */

/** The logo: a 5×5 checkerboard of glass tiles. */
const LOGO = [".x.x.", "x.x.x", ".x.x.", "x.x.x", ".x.x."];

export function Tiles({ pattern = LOGO, size = 34, gap = 8, float = false, ghost = false, className = "" }: { pattern?: string[]; size?: number; gap?: number; float?: boolean; ghost?: boolean; className?: string }) {
  const cols = pattern[0].length;
  return <div className={`lg-tiles${float ? " float" : ""} ${className}`} aria-hidden="true" style={{ "--tc": cols, "--ts": `${size}px`, "--tg": `${gap}px` } as React.CSSProperties}>
    {pattern.flatMap((row, r) => [...row].map((cell, c) => <i key={`${r}-${c}`} className={cell === "x" ? "" : ghost ? "ghost" : "off"} style={{ "--d": (r * cols + c) % 7 } as React.CSSProperties} />))}
  </div>;
}

/* ------------------------------------------------------------ primitives */

export function Label({ children }: { children: ReactNode }) { return <span className="lg-label">{children}</span>; }

export function Head({ label, title, children, center = false }: { label: string; title: ReactNode; children?: ReactNode; center?: boolean }) {
  return <div className={`lg-head${center ? " center" : ""}`}><Label>{label}</Label><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

/** The hero every inner page opens with: label, big title, lede, and a side column. */
export function PageHero({ label, title, lede, side, tiles = true }: { label: string; title: ReactNode; lede: ReactNode; side?: ReactNode; tiles?: boolean }) {
  return <section className="pg-hero">
    <div className="lg-grid lg-grid-fade" aria-hidden="true" />
    <div className="lg-wrap pg-hero-inner lg-in">
      <div><Label>{label}</Label><h1>{title}</h1></div>
      <div className="pg-hero-side">{tiles && <div className="pg-hero-tiles"><Tiles size={16} gap={5} float /></div>}<p className="lede">{lede}</p>{side}</div>
    </div>
  </section>;
}

export function Faq({ items }: { items: [string, string][] }) {
  return <div className="lg-faq">{items.map(([q, a]) => <details key={q}><summary>{q}<i><Plus size={16} /></i></summary><p>{a}</p></details>)}</div>;
}

export function Cta({ label = "Ready when you are", title, children, actions }: { label?: string; title: ReactNode; children: ReactNode; actions: ReactNode }) {
  return <section className="lg-section tight"><div className="lg-wrap"><div className="lg-cta">
    <Tiles size={26} gap={6} float pattern={[".x.x", "x.x.", ".x.x"]} />
    <div><Label>{label}</Label><h2 style={{ marginTop: 18 }}>{title}</h2><p>{children}</p></div>
    <div className="lg-actions">{actions}</div>
  </div></div></section>;
}

/* --------------------------------------------------------- scroll reveal */

const REVEAL = ".lg-head, .lg-bento > *, .lg-stats > div, .lg-frame, .lg-card, .lg-faq details, .lg-cta, .lg-reveal-me";

function useReveal(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const main = root.current;
    if (!main || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.classList.add("is-in");
      io.unobserve(el);
      // hand the element back to its own hover transitions once it has arrived
      window.setTimeout(() => el.classList.remove("lg-reveal", "is-in"), 1400 + parseInt(el.style.getPropertyValue("--lg-d") || "0", 10));
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    const scan = () => main.querySelectorAll<HTMLElement>(REVEAL).forEach(el => {
      if (seen.has(el) || el.closest(".lg-in")) return;
      seen.add(el);
      const index = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.setProperty("--lg-d", `${Math.min(index, 6) * 70}ms`);
      el.classList.add("lg-reveal");
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [root]);
}

/* ---------------------------------------------------------------- footer */

const COLUMNS: [string, [string, string][]][] = [
  ["Programs", [["/programs/aica", "AI Career Accelerator"], ["/programs/ai-generalist", "AI Generalist"], ["/programs/ai-architect", "AI Architect"], ["/programs/cybersecurity", "Cyber Security"], ["/programs/soc-analyst", "SOC Analyst"], ["/masterclass", "Free masterclass"]]],
  ["For colleges", [["/college-programs", "College programs"], ["/college-partnerships", "Partnerships"], ["/international", "International learners"]]],
  ["Resources", [["/blog", "Blog"], ["/glossary", "Glossary"], ["/questions", "FAQs"], ["/tools/ai-skills-quiz", "AI skills quiz"], ["/why-now", "Why AI matters now"]]],
  ["Company", [["/about", "About ONROL"], ["/contact", "Contact"], ["/privacy-policy", "Privacy policy"], ["/terms-and-conditions", "Terms"]]],
];

function Newsletter() {
  const lead = useLeadForm();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email")).trim();
    if (await lead.save({ email, source: "Newsletter", campaign: "newsletter" })) form.reset();
  }
  return <div className="lg-news">
    <div><h4>Join the newsletter</h4><p>Useful AI tips for India, straight to your inbox. No spam.</p></div>
    {lead.state === "saved"
      ? <p className="lg-form-ok" role="status"><Check size={18} /> Thanks, you’re on the list.</p>
      : <form onSubmit={submit}>
          <label className="sr-only" htmlFor="lg-news-email">Email address</label>
          <input id="lg-news-email" name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
          <button className="lg-btn" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Saving…" : "Subscribe"}</button>
        </form>}
    {lead.error && <p className="lg-form-error" role="alert">{lead.error}</p>}
  </div>;
}

function Footer() {
  return <footer className="lg-footer"><div className="lg-wrap">
    <div className="lg-footer-top">
      <div className="lg-footer-brand">
        <Link to="/" className="lg-brand"><img src="/home-glydi/logo-mark.png" alt="" width="34" height="34" />ONROL</Link>
        <p>India’s AI Execution School. Live, mentor-led and project-first, from Hyderabad.</p>
        <div className="lg-socials">
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
          <a href="https://youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={16} /></a>
          <a href="mailto:info@onrol.in" aria-label="Email"><Mail size={16} /></a>
        </div>
      </div>
      {COLUMNS.map(([heading, links]) => <nav className="lg-footer-col" key={heading} aria-label={heading}><h4>{heading}</h4>{links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>)}
    </div>
    <Newsletter />
    <div className="lg-wordmark" aria-hidden="true">ONROL</div>
    <div className="lg-footer-bottom"><span>© {new Date().getFullYear()} ONROL, AI Execution School · Hyderabad, India</span><div><a href="mailto:info@onrol.in">info@onrol.in</a><a href="#top">Back to top ↑</a></div></div>
  </div></footer>;
}

/* ---------------------------------------------------------------- layout */

type Seo = { title: string; description: string; path: string; jsonLd?: object | object[] };

export function SiteLayout({ seo, children }: { seo: Seo; children: ReactNode }) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.body.classList.add("site-body");
    window.scrollTo(0, 0);
    return () => document.body.classList.remove("site-body");
  }, []);
  useReveal(main);
  return <div className="site" id="top">
    <SEO title={seo.title} description={seo.description} path={seo.path} jsonLd={seo.jsonLd} />
    <main ref={main} id="site-main">{children}</main>
    <Footer />
    <ApplyDialog />
  </div>;
}

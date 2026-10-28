import { Children, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Instagram, Linkedin, Mail, MessageCircle, Play, X, Youtube } from "lucide-react";
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

export const APPLY_EVENT = "onrol:apply";

/** Opens the Apply dialog from anywhere; the navbar dispatches the same event. */
export function openApply(course?: string) { window.dispatchEvent(new CustomEvent(APPLY_EVENT, { cancelable: true, detail: { course } })); }

export function ApplyButton({ children = "Apply now", className = "ox-btn", course }: { children?: ReactNode; className?: string; course?: string }) {
  return <button type="button" className={className} onClick={() => openApply(course)}>{children} <ArrowRight size={18} /></button>;
}

function ApplyDialog({ course: pageCourse }: { course?: string }) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState<string | undefined>(pageCourse);
  const lead = useLeadForm();
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onApply = (event: Event) => {
      event.preventDefault();
      lead.reset();
      setCourse((event as CustomEvent<{ course?: string }>).detail?.course ?? pageCourse);
      setOpen(true);
    };
    window.addEventListener(APPLY_EVENT, onApply);
    return () => window.removeEventListener(APPLY_EVENT, onApply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCourse]);
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
    if (await lead.save({ name, email, phone, source: "Apply modal", campaign: "apply", ...(course ? { course } : {}) }, "We couldn’t save your application just now. Please try again.")) {
      openWhatsApp([`Hi ONROL, I’d like to apply${course ? ` for the ${course}` : " for the next cohort"}.`, "", `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`]);
      form.reset();
    }
  }
  return <div className="ox-modal" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
    <div className="ox-panel" role="dialog" aria-modal="true" aria-labelledby="ox-apply-title">
      <button className="ox-close" type="button" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button>
      <span className="ox-eyebrow"><i />{course ? course : "Apply to ONROL"}</span>
      <h2 id="ox-apply-title">Start with a quick hello.</h2>
      <p>Leave your details and our team calls you back about the fit and the next cohort.</p>
      <div className="ox-steps-mini"><span>20 seconds</span><span>No payment</span><span>We call you back</span></div>
      {lead.state === "saved"
        ? <p className="ox-form-ok" role="status"><Check size={18} /> Thanks, you’re in. WhatsApp has opened with your details so you can say hello.</p>
        : <form className="ox-form" onSubmit={submit}>
            <label>Full name<input ref={first} name="name" required maxLength={100} autoComplete="name" placeholder="Your name" /></label>
            <label>Email<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@email.com" /></label>
            <label>Phone / WhatsApp<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" /></label>
            {lead.error && <p className="ox-form-error" role="alert">{lead.error}</p>}
            <button className="ox-btn" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Saving…" : "Apply now"} <ArrowRight size={18} /></button>
            <p className="ox-form-note">No spam. We only contact you about your application.</p>
          </form>}
    </div>
  </div>;
}

/* ---------------------------------------------------------------- motion */

const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One motion layer per page: scroll reveals ([data-reveal], staggered by
 * sibling order), the pointer spotlight on .ox-spot cards, the hero glow that
 * follows the cursor, and a light parallax on .ox-parallax frames.
 */
function useMotion(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const main = root.current;
    if (!main) return;
    document.documentElement.classList.add("ox-js");

    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const card = target?.closest?.<HTMLElement>(".ox-spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - r.left}px`);
        card.style.setProperty("--my", `${event.clientY - r.top}px`);
      }
      const glow = target?.closest?.<HTMLElement>("[data-glow]");
      if (glow) {
        const r = glow.getBoundingClientRect();
        glow.style.setProperty("--gx", `${((event.clientX - r.left) / r.width) * 100}%`);
        glow.style.setProperty("--gy", `${((event.clientY - r.top) / r.height) * 100}%`);
      }
    };
    main.addEventListener("pointermove", onPointer, { passive: true });

    if (reduced() || !("IntersectionObserver" in window)) {
      main.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in"));
      return () => main.removeEventListener("pointermove", onPointer);
    }

    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.classList.add("is-in");
      io.unobserve(el);
      // hand the element back to its own hover transitions once it has arrived
      window.setTimeout(() => el.classList.add("is-done"), 1300 + parseInt(el.style.getPropertyValue("--rd") || "0", 10));
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const seen = new WeakSet<Element>();
    const scan = () => main.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      if (!el.style.getPropertyValue("--rd")) {
        const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.hasAttribute("data-reveal")) : [];
        el.style.setProperty("--rd", `${Math.min(Math.max(siblings.indexOf(el), 0), 6) * 90}ms`);
      }
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true, subtree: true });

    let frame = 0;
    const parallax = () => {
      frame = 0;
      const vh = window.innerHeight;
      main.querySelectorAll<HTMLElement>(".ox-parallax").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--py", `${(progress * -40).toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(parallax); };
    window.addEventListener("scroll", onScroll, { passive: true });
    parallax();

    return () => {
      io.disconnect(); mo.disconnect();
      main.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [root]);
}

/** Counts up to `to` the first time it scrolls into view. */
export function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);
  useEffect(() => {
    const node = el.current;
    if (!node || reduced() || !("IntersectionObserver" in window)) return;
    setValue(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 4))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={el}>{value}{suffix && <em>{suffix}</em>}</span>;
}

/** Cycles through words in place, each blurring up into view. */
export function Rotator({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const id = window.setInterval(() => setI(n => (n + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);
  return <span className="ox-rotator"><span key={words[i]}>{words[i]}</span></span>;
}

/** Headline lines that slide up out of their own masks, one after another. */
export function Lines({ children, as: Tag = "h1", className = "" }: { children: ReactNode; as?: "h1" | "h2"; className?: string }) {
  return <Tag className={`ox-lines ${className}`}>
    {Children.toArray(children).map((line, i) => <span key={i}><span style={{ "--i": i } as CSSProperties}>{line}</span></span>)}
  </Tag>;
}

export function Marquee({ children, duration = 40, reverse = false, gap = 14 }: { children: ReactNode; duration?: number; reverse?: boolean; gap?: number }) {
  const style = { "--dur": `${duration}s`, "--dir": reverse ? "reverse" : "normal", "--gap": `${gap}px` } as CSSProperties;
  return <div className="ox-marquee" style={style}>
    <div className="ox-marquee-track">{children}</div>
    <div className="ox-marquee-track" aria-hidden="true">{children}</div>
  </div>;
}

/* ------------------------------------------------------------ primitives */

export function Eyebrow({ children }: { children: ReactNode }) { return <span className="ox-eyebrow"><i />{children}</span>; }

export function Head({ eyebrow, title, children, center = false, split = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; center?: boolean; split?: boolean }) {
  if (split) return <div className="ox-head is-split" data-reveal><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div>{children && <p className="ox-lede">{children}</p>}</div>;
  return <div className={`ox-head${center ? " is-center" : ""}`} data-reveal><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{children && <p className="ox-lede">{children}</p>}</div>;
}

/** Native <details>, animated open and closed with a grid-rows transition. */
export function Faq({ items, name = "ox-faq" }: { items: [string, string][]; name?: string }) {
  return <div className="ox-faq">{items.map(([q, a], i) => <details key={q} name={name} open={i === 0} data-reveal>
    <summary>{q}<i aria-hidden="true" /></summary>
    <div className="ox-faq-body"><div><p>{a}</p></div></div>
  </details>)}</div>;
}

export function Cta({ eyebrow = "Ready when you are", title, children, actions }: { eyebrow?: string; title: ReactNode; children: ReactNode; actions: ReactNode }) {
  return <section className="ox-sec is-tight"><div className="ox-wrap"><div className="ox-cta is-dark" data-reveal="scale">
    <div className="ox-cta-rings" aria-hidden="true"><i /><i /><i /></div>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2>{title}</h2>
    <p className="ox-lede">{children}</p>
    <div className="ox-actions">{actions}</div>
  </div></div></section>;
}

/** The dark opening every inner page shares. */
export function PageHero({ eyebrow, title, lede, side, crumbs }: { eyebrow: string; title: ReactNode; lede: ReactNode; side?: ReactNode; crumbs?: [string, string][] }) {
  return <section className="ox-page-hero is-dark" data-glow>
    <div className="ox-aurora" aria-hidden="true"><i /><i /><i /></div>
    <div className="ox-grid-bg" aria-hidden="true" />
    <div className="ox-cursor-glow" aria-hidden="true" />
    <div className="ox-noise" aria-hidden="true" />
    <div className="ox-wrap">
      {crumbs && <nav className="ox-crumbs ox-fade-up" aria-label="Breadcrumb">{crumbs.map(([to, label], i) => <span key={to}>{i > 0 && <span aria-hidden="true">/ </span>}<Link to={to}>{label}</Link></span>)}</nav>}
      <div className="ox-page-hero-grid">
        <div><span className="ox-fade-up" style={{ "--d": "80ms" } as CSSProperties}><Eyebrow>{eyebrow}</Eyebrow></span>{title}</div>
        <div className="ox-page-hero-side ox-fade-up" style={{ "--d": "500ms" } as CSSProperties}><p className="ox-lede">{lede}</p>{side}</div>
      </div>
    </div>
  </section>;
}

export function Film({ caption = "Watch the ONROL story" }: { caption?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return <div className="ox-video" data-reveal="scale">
    <video ref={video} src={playing ? "/home-glydi/about_onrol.mp4" : undefined} preload="none" playsInline controls={playing} onEnded={() => setPlaying(false)} />
    {!playing && <button type="button" className="ox-video-cover" style={{ "--poster": "url('/home-glydi/about-poster.webp')" } as CSSProperties} onClick={() => { setPlaying(true); requestAnimationFrame(() => void video.current?.play()); }}>
      <b>{caption}</b><span className="ox-play"><Play size={26} fill="currentColor" /></span>
    </button>}
  </div>;
}

/* ---------------------------------------------------------------- footer */

const COLUMNS: [string, [string, string][]][] = [
  ["Programs", [["/programs/aica", "AI Career Accelerator"], ["/programs/ai-generalist", "AI Generalist"], ["/programs/ai-architect", "AI Architect"], ["/programs/cybersecurity", "Cyber Security"], ["/programs/soc-analyst", "SOC Analyst"], ["/masterclass", "Free masterclass"]]],
  ["For colleges", [["/college-programs", "College programs"], ["/college-partnerships", "Partnerships"], ["/international", "International learners"]]],
  ["Resources", [["/blog", "Blog"], ["/glossary", "Glossary"], ["/questions", "FAQs"], ["/tools/ai-skills-quiz", "AI skills quiz"], ["/why-now", "Why AI matters now"]]],
  ["Company", [["/about", "About ONROL"], ["/mentors", "Mentors"], ["/contact", "Contact"], ["/privacy-policy", "Privacy policy"], ["/terms-and-conditions", "Terms"]]],
];

function Newsletter() {
  const lead = useLeadForm();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email")).trim();
    if (await lead.save({ email, source: "Newsletter", campaign: "newsletter" })) form.reset();
  }
  return <div className="ox-news">
    <div><h4>Join the newsletter</h4><p>Useful AI tips for India, straight to your inbox. No spam.</p></div>
    <div>
      {lead.state === "saved"
        ? <p className="ox-form-ok" role="status"><Check size={18} /> Thanks, you’re on the list.</p>
        : <form onSubmit={submit}>
            <label className="sr-only" htmlFor="ox-news-email">Email address</label>
            <input id="ox-news-email" name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
            <button className="ox-btn" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Saving…" : "Subscribe"}</button>
          </form>}
      {lead.error && <p className="ox-form-error" role="alert" style={{ marginTop: 10 }}>{lead.error}</p>}
    </div>
  </div>;
}

function Wordmark() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reduced() || !("IntersectionObserver" in window)) { node.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={el} className="ox-wordmark" aria-hidden="true">{[..."ONROL"].map((c, i) => <span key={i} style={{ "--i": i } as CSSProperties}>{c}</span>)}</div>;
}

export function Footer() {
  return <footer className="ox-footer"><div className="ox-wrap">
    <div className="ox-footer-top">
      <div className="ox-footer-brand">
        <Link to="/" className="ox-brand"><img src="/home-glydi/logo-mark.png" alt="" width="36" height="36" />ONROL</Link>
        <p>India’s AI Execution School. Live, mentor-led and project-first, from Hyderabad.</p>
        <div className="ox-socials">
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
          <a href="https://youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={17} /></a>
          <a href="mailto:info@onrol.in" aria-label="Email"><Mail size={17} /></a>
        </div>
      </div>
      {COLUMNS.map(([heading, links]) => <nav className="ox-footer-col" key={heading} aria-label={heading}><h4>{heading}</h4>{links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>)}
    </div>
    <Newsletter />
    <Wordmark />
    <div className="ox-footer-bottom"><span>© {new Date().getFullYear()} ONROL, AI Execution School · Hyderabad, India</span><div><a href="mailto:info@onrol.in">info@onrol.in</a><a href="#top">Back to top ↑</a></div></div>
  </div></footer>;
}

/** On phones, a thumb-reach Apply bar appears once the hero has scrolled away. */
function MobileCta() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => setOn(window.scrollY > window.innerHeight * 0.8 && window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 600);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return <div className={`ox-mobile-cta${on ? " is-on" : ""}`} aria-hidden={!on}>
    <a className="ox-btn is-ghost" href={WHATSAPP} target="_blank" rel="noreferrer" tabIndex={on ? 0 : -1} aria-label="Chat on WhatsApp"><MessageCircle size={20} /></a>
    <ApplyButton>Apply now</ApplyButton>
  </div>;
}

/* ---------------------------------------------------------------- layout */

type Seo = { title: string; description: string; path: string; jsonLd?: object | object[] };

export function SiteLayout({ seo, course, children }: { seo: Seo; course?: string; children: ReactNode }) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.body.classList.add("ox-body");
    window.scrollTo(0, 0);
    return () => document.body.classList.remove("ox-body");
  }, [seo.path]);
  useMotion(main);
  return <div className="ox" id="top">
    <SEO title={seo.title} description={seo.description} path={seo.path} jsonLd={seo.jsonLd} />
    <a className="ox-skip" href="#ox-main">Skip to content</a>
    <main ref={main} id="ox-main">{children}</main>
    <Footer />
    <MobileCta />
    <ApplyDialog course={course} />
  </div>;
}


import { useEffect, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Check, Plus } from "lucide-react";
import { SiteLayout, Tiles } from "@/site/Site";
import "./pathways.css";

export const inquiryOptions = ["AI Career Accelerator", "AI Generalist", "AI Architect", "Cyber Security", "SOC Analyst", "Help me choose"];

type PathwaySeo = { title: string; description: string; path: string };

export function PathwayLayout({ children, international = false, seo }: { children: ReactNode; international?: boolean; seo?: PathwaySeo }) {
  useEffect(() => {
    document.body.classList.add("pathway-body");
    window.scrollTo(0, 0);
    return () => document.body.classList.remove("pathway-body");
  }, []);
  useReveal();
  const meta = seo ?? (international
    ? { title: "International Learners | ONROL", description: "Explore ONROL's AI and cybersecurity learning pathways from outside India. Compare programs, check time zones and discuss your cohort with our team.", path: "/international" }
    : { title: "College Programs & Campus Partnerships | ONROL", description: "Bring practical AI and cybersecurity learning to your college. Explore campus workshop, cohort and project lab proposals with ONROL.", path: "/college-programs" });
  // The Light Grid shell (navbar spacing, footer, Apply dialog) around the pathway content.
  return <SiteLayout seo={meta}>
    <div className="pathway-site" id="pathway-main">{children}</div>
  </SiteLayout>;
}

/** Pathway photos ship with a 900px `-sm` twin; ONROL event photos with a 720px `-small` one. */
function srcSetFor(src: string) {
  if (src.startsWith("/pathways/")) return `${src.replace(".webp", "-sm.webp")} 900w, ${src} 1600w`;
  if (/\/lifeatonrol\/[^/]+\/\d+\.webp$/.test(src)) return `${src.replace(".webp", "-small.webp")} 720w, ${src} 1600w`;
  return undefined;
}

export function Photo({ src, alt = "", sizes, className, eager = false, position }: { src: string; alt?: string; sizes: string; className?: string; eager?: boolean; position?: string }) {
  return <img className={className} style={position ? { objectPosition: position } : undefined} src={src} srcSet={srcSetFor(src)} sizes={sizes} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchpriority: "high" } : {})} />;
}

export function PathwayHero({ image, focus = "50% 50%", focusMobile, label, title, children, actions, stats }: { image: string; focus?: string; focusMobile?: string; label: string; title: ReactNode; children: ReactNode; actions: ReactNode; stats: [string, string][] }) {
  return <section className="pw-hero" style={{ "--pw-focus": focus, "--pw-focus-sm": focusMobile ?? focus } as CSSProperties}>
    <div className="lg-grid lg-grid-fade pw-hero-grid" aria-hidden="true" />
    <div className="pw-wrap pw-hero-inner">
      <div className="pw-hero-copy"><span className="pw-label">{label}</span><h1>{title}</h1><p>{children}</p><div className="pw-actions">{actions}</div></div>
      <div className="pw-hero-art"><div className="pw-hero-frame"><Photo className="pw-hero-media" src={image} sizes="(max-width: 1024px) 100vw, 46vw" eager /></div><div className="pw-hero-tiles"><Tiles size={22} gap={6} float /></div></div>
    </div>
    <div className="pw-wrap"><dl className="pw-hero-stats">{stats.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div>
  </section>;
}

export type CampusPhoto = { src: string; event: string; caption: string; focus?: string };

export function CampusProof({ number, title, intro, photos, note }: { number: string; title: ReactNode; intro: string; photos: CampusPhoto[]; note: string }) {
  return <section className="pw-proof-section"><div className="pw-wrap pw-section"><SectionHeading number={number} label="ONROL ON CAMPUS" title={title}>{intro}</SectionHeading><div className={`pw-proof is-${photos.length}`}>{photos.map((photo, i) => <figure key={photo.src}><Photo src={photo.src} alt={photo.caption} position={photo.focus} sizes={i === 0 ? "(max-width: 800px) 100vw, 48vw" : "(max-width: 800px) 50vw, 26vw"} /><figcaption><span>{photo.event}</span>{photo.caption}</figcaption></figure>)}</div><div className="pw-proof-foot"><p>{note}</p><a className="pw-text-link" href="#enquire">Plan a session like this <ArrowUpRight size={16} /></a></div></div></section>;
}

/** The enquiry band every pathway page ends on: pitch, trust notes and a framed photo on the left, the form card on the right. */
export function EnquiryFrame({ image, label, title, children, trust, form }: { image: string; label: string; title: ReactNode; children: ReactNode; trust: string[]; form: ReactNode }) {
  return <section id="enquire" className="pw-enquire"><div className="lg-grid pw-enquire-grid-bg" aria-hidden="true" /><div className="pw-wrap pw-enquire-grid"><div className="pw-enquire-pitch"><span className="pw-label">{label}</span><h2>{title}</h2>{children}<ul className="pw-trust">{trust.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><div className="pw-enquire-photo"><Photo src={image} sizes="(max-width: 1024px) 100vw, 40vw" /></div><a href="mailto:info@onrol.in">Prefer email? info@onrol.in <ArrowUpRight size={16} /></a></div>{form}</div></section>;
}

/** Fades sections in as they scroll into view. Elements stay visible without JS
    and for anyone who prefers reduced motion. */
const REVEAL = ".pw-section-heading, .pw-card, .pw-dark-card, .pw-steps article, .pw-proof figure, .pw-track-panel, .pw-timezone, .pw-outcome, .pw-gains-list li, .pw-faq details, .pw-enquire-grid > *, .pw-research, .pw-global-note .pw-wrap > *, .pw-why-media, .pw-reason";

function useReveal() {
  useEffect(() => {
    const main = document.getElementById("pathway-main");
    if (!main || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.classList.add("is-in");
      io.unobserve(el);
      // Hand the element back to its own hover transitions once it has arrived.
      window.setTimeout(() => el.classList.remove("pw-reveal", "is-in"), 1500 + parseInt(el.style.getPropertyValue("--pw-delay") || "0", 10));
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    const scan = () => main.querySelectorAll<HTMLElement>(REVEAL).forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(child => child.matches(REVEAL)) : [];
      el.style.setProperty("--pw-delay", `${Math.min(siblings.indexOf(el), 6) * 80}ms`);
      el.classList.add("pw-reveal");
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

export function SectionHeading({ number, label, title, children }: { number: string; label: string; title: ReactNode; children?: ReactNode }) {
  return <div className="pw-section-heading"><span className="pw-label"><i>{number}</i> {label}</span><div><h2>{title}</h2>{children && <p>{children}</p>}</div></div>;
}

export function FAQ({ items }: { items: { question: string; answer: string }[] }) {
  return <div className="pw-faq">{items.map(({ question, answer }) => <details key={question}><summary>{question}<Plus size={20} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>;
}

export function Enquiry({ international = false }: { international?: boolean }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const message = [international ? "Hello ONROL, I’m enquiring as an international learner." : "Hello ONROL, I’d like to discuss a college program.", `Name: ${values.get("name")}`, `Email: ${values.get("email")}`, `${international ? "Country / time zone" : "College / institution"}: ${values.get("context")}`, `Interest: ${values.get("interest")}`, `Details: ${values.get("message") || "Please help me find a suitable option."}`].join("\n");
    window.open(`https://wa.me/918121306701?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  return <EnquiryFrame image={international ? "/pathways/enquire-international.webp" : "/pathways/enquire-college.webp"} label="GOOD THINGS START WITH A CONVERSATION" title={international ? <>Your next chapter.<br /><em>Let’s build it.</em></> : <>A stronger campus.<br /><em>Starts here.</em></>} trust={international ? ["Takes under a minute", "You review the message before it is sent", "Fees, timings and terms confirmed in writing"] : ["Takes under a minute", "You review the message before it is sent", "A written proposal before anything is confirmed"]} form={<form className="pw-form" onSubmit={submit}><h3 className="pw-form-title">{international ? "Start your enquiry" : "Plan a campus program"}</h3><p>Share a few details and we’ll continue the conversation on WhatsApp.</p><div className="pw-form-row"><label>Full name<input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" /></label><label>Email address<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@example.com" /></label></div><label>{international ? "Country / time zone" : "College / institution"}<input name="context" required maxLength={180} placeholder={international ? "e.g. United Kingdom / Europe/London" : "Your college and city"} /></label><label>{international ? "Program interest" : "What are you planning?"}<select name="interest" defaultValue="" required><option value="" disabled>Select an option</option>{(international ? inquiryOptions : ["Campus workshop", "Student cohort", "Project lab / build sprint", "Faculty introduction", "Help us design a program"]).map(option => <option key={option}>{option}</option>)}</select></label><label>A little more about your goals <span>(optional)</span><textarea name="message" rows={3} maxLength={1500} placeholder={international ? "Your background, goals and preferred session times…" : "Student group, department, preferred dates and goals…"} /></label><button className="pw-button" type="submit">Continue on WhatsApp <ArrowUpRight size={18} /></button><p className="pw-form-note">Opens WhatsApp with your enquiry ready to review and send. Nothing is submitted until you send it there. <Link to="/privacy-policy">Privacy policy</Link></p></form>}><p>{international ? "Tell us where you are and what you want to build. We’ll help you discuss the right program, timing and next steps." : "Tell us about your students and your goals. Let’s scope a practical learning experience around your campus."}</p></EnquiryFrame>;
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) { return <Link className="pw-text-link" to={to}>{children} <ArrowRight size={16} /></Link>; }

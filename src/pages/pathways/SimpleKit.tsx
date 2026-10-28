import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Check, type LucideIcon } from "lucide-react";
import { Photo } from "./PathwayLayout";
import "./simple.css";

/* Minimal layout for the college pages (programs and partnerships): white sections,
   plain headings, simple cards and one photo per section. */

export function SxPage({ children }: { children: ReactNode }) {
  return <div className="sx-page">{children}</div>;
}

export function SxSection({ id, soft = false, children }: { id?: string; soft?: boolean; children: ReactNode }) {
  return <section id={id} className={`sx-section${soft ? " is-soft" : ""}`}><div className="pw-wrap">{children}</div></section>;
}

export function SxHero({ kicker, title, children, actions, image, alt, facts }: { kicker: string; title: ReactNode; children: ReactNode; actions: ReactNode; image: string; alt: string; facts: [string, string][] }) {
  return <section className="sx-hero"><div className="pw-wrap">
    <div className="sx-hero-grid">
      <div><span className="sx-kicker">{kicker}</span><h1>{title}</h1><p className="sx-lead">{children}</p><div className="sx-actions">{actions}</div></div>
      <figure className="sx-hero-photo"><Photo src={image} alt={alt} sizes="(max-width: 900px) 100vw, 48vw" eager /></figure>
    </div>
    <dl className="sx-facts">{facts.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
  </div></section>;
}

export function SxHeading({ kicker, title, children, center = false }: { kicker: string; title: ReactNode; children?: ReactNode; center?: boolean }) {
  return <div className={`sx-heading sx-r${center ? " is-center" : ""}`}><span className="sx-kicker">{kicker}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

export function SxChecks({ items }: { items: string[] }) {
  return <ul className="sx-checks">{items.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>;
}

export function SxCard({ icon: Icon, label, title, wide = false, children }: { icon?: LucideIcon; label?: string; title: string; wide?: boolean; children: ReactNode }) {
  return <article className={`sx-card sx-r${wide ? " is-wide" : ""}`}>{Icon && <span className="sx-icon"><Icon size={20} /></span>}{label && <span className="sx-card-label">{label}</span>}<h3>{title}</h3>{children}</article>;
}

export function SxSteps({ steps }: { steps: [string, string][] }) {
  return <ol className="sx-steps" style={{ "--n": steps.length } as CSSProperties}>{steps.map(([title, text], i) => <li className="sx-r" key={title}><span>{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>;
}

/** Same props as EnquiryFrame, so the shared enquiry forms can render inside either. */
export function SxEnquire({ label, title, children, trust, form }: { image?: string; label: string; title: ReactNode; children: ReactNode; trust: string[]; form: ReactNode }) {
  return <section id="enquire" className="sx-section sx-enquire"><div className="pw-wrap sx-enquire-grid">
    <div><span className="sx-kicker">{label}</span><h2>{title}</h2>{children}<ul className="sx-checks">{trust.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul><a className="sx-link" href="mailto:info@onrol.in">Prefer email? info@onrol.in <ArrowUpRight size={16} /></a></div>
    {form}
  </div></section>;
}

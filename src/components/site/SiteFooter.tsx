import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SOCIAL } from "@/lib/brand";
import "./site-footer.css";

/* The site footer for React-rendered pages. It mirrors the footer in the
   glydi page markup (src/pages/glydi/markup/*.html, styled by
   public/home-glydi/footer-shared.css) so every page ends the same way. */

const CRM_LEADS_URL = "https://go.onrol.in/api/public/leads";

const columns: [string, [string, string][]][] = [
  ["Programs", [["/programs/aica", "AI Career Accelerator"], ["/programs/ai-generalist", "AI Generalist"], ["/programs/ai-architect", "AI Architect"], ["/programs/soc-analyst", "SOC Analyst"], ["/programs/cybersecurity", "Cyber Security"], ["/programs", "All Programs"], ["/masterclass", "Free Masterclass"]]],
  ["Resources", [["/blog", "Blog"], ["/glossary", "Glossary"], ["/questions", "FAQs"], ["/tools/ai-skills-quiz", "AI Skills Quiz"], ["/why-now", "Why AI matters now"]]],
  ["Company", [["/about", "About ONROL"], ["/contact", "Contact"], ["/privacy-policy", "Privacy Policy"], ["/terms-and-conditions", "Terms"]]],
];

const socials = [
  { href: SOCIAL.instagram, label: "Instagram", icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" /></> },
  { href: SOCIAL.linkedin, label: "LinkedIn", icon: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10.5v6M7 7.5v.01M11.5 16.5v-3.2a2 2 0 0 1 4 0v3.2M11.5 16.5v-6" /></> },
  { href: SOCIAL.youtube, label: "YouTube", icon: <><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M11 9.6l4 2.4-4 2.4z" /></> },
  { href: "mailto:info@onrol.in", label: "Email", icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7.5l8 5.5 8-5.5" /></> },
];

export default function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (new FormData(form).get("email") as string | null)?.trim();
    if (!email) return;
    // Same capture as the glydi pages' newsletter: best-effort, never blocks the thank-you.
    fetch(CRM_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, source: "Newsletter", campaign: "newsletter" }),
      keepalive: true,
    }).catch(() => {});
    form.reset();
    setSubscribed(true);
  }

  return <footer className="site-footer">
    <div className="sf-top">
      <div className="sf-brand">
        <Link className="sf-logo" to="/">ONROL</Link>
        <p className="sf-copy">&copy; {new Date().getFullYear()} ONROL, AI Execution School, Hyderabad. All rights reserved.</p>
        <div className="sf-socials">{socials.map(s => <a key={s.label} href={s.href} {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} aria-label={s.label}><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon}</svg></a>)}</div>
      </div>
      <nav className="sf-cols" aria-label="Footer links">{columns.map(([heading, links]) => <div className="sf-col" key={heading}>
        <h4>{heading}</h4>
        <ul>{links.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
      </div>)}</nav>
    </div>
    <div className="sf-news">
      <div className="sf-news-text">
        <h4>Join our newsletter</h4>
        <p>Useful AI tips for India, straight to your inbox. No spam.</p>
      </div>
      <form className="sf-form" onSubmit={subscribe}>
        <input type="email" name="email" placeholder="Enter your email" autoComplete="email" aria-label="Email address" required />
        <button type="submit">Subscribe</button>
      </form>
    </div>
    {subscribed && <p className="sf-news-msg" role="status">Thanks, you&rsquo;re on the list.</p>}
    <p className="sf-legal">ONROL · AI Execution School · Hyderabad, India</p>
  </footer>;
}

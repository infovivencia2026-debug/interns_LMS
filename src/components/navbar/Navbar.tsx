import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./navbar.css";

const links: readonly (readonly [string, string])[] = [
  ["/", "Home"],
  ["/programs", "Programs"],
  // College Partnership is in local preview: shown (and routed) on the dev server only until approved.
  ...(import.meta.env.DEV ? [["/college-partnership", "College Partnership"] as const] : []),
  ["/about", "About"],
  ["https://interns.onrol.in/", "Interns"],
  ["/contact", "Contact"],
];

/** One public-site navbar, rendered outside every page's theme. */
export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    // The menu floats over the page, so scrolling away or widening the window closes it.
    const close = () => setOpen(false);
    const wide = matchMedia("(min-width: 1024px)");
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("scroll", close, { passive: true });
    wide.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("scroll", close);
      wide.removeEventListener("change", close);
    };
  }, [open]);

  return <header id="onrol-navbar" ref={header} onKeyDown={event => {
    if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
  }}>
    <Link className="onrol-nav-logo" to="/" aria-label="ONROL home">
      <img src="/home-glydi/logo-mark.png" alt="ONROL" width="40" height="40" />
    </Link>
    <button ref={toggle} id="onrol-menu-toggle" type="button" aria-controls="onrol-nav-links" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>
      <span /><span /><span />
    </button>
    <nav id="onrol-nav-links" aria-label="Main navigation" className={open ? "is-open" : ""} onClick={() => setOpen(false)}>
      {links.map(([to, label]) => to.startsWith("https:")
        ? <a key={to} href={to} onClick={event => { event.stopPropagation(); setOpen(false); }}>{label}</a>
        : <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}
      <Link className="onrol-nav-apply" to="/programs/ai-generalist" onClick={event => {
        const apply = document.querySelector<HTMLAnchorElement>("#home-glydi .nav-apply.js-apply");
        if (apply) { event.preventDefault(); apply.click(); }
      }}>Apply</Link>
    </nav>
  </header>;
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export type Track = "All" | "AI" | "Cyber";

export const CARDS = [
  { slug: "aica", badge: "Start here", name: "AI Career Accelerator", text: "Twenty-one live sessions, an hour a day. Start at zero and finish with a career project and a portfolio.", length: "21 days", level: "Beginner", track: "AI", image: "/home-glydi/cards/aica.jpg" },
  { slug: "ai-generalist", badge: "Flagship", name: "AI Generalist", text: "An AI website, an automation system and your own domain agent, all built, deployed and yours to show.", length: "3 months", level: "Flagship", track: "AI", image: "/home-glydi/cards/generalist.jpg" },
  { slug: "ai-architect", badge: "Advanced", name: "AI Architect", text: "Multi-agent workflows, RAG pipelines and the orchestration that keeps them running in production.", length: "6 + 6 months", level: "Advanced", track: "AI", image: "/home-glydi/cards/architect.jpg" },
  { slug: "cybersecurity", badge: "Foundation", name: "Cyber Security", text: "Networks, systems and threats, taught through hands-on labs from the first week.", length: "6 months", level: "No prior security", track: "Cyber", image: "/home-glydi/cards/cyber.jpg" },
  { slug: "soc-analyst", badge: "Career track", name: "SOC Analyst", text: "Detection, triage and response on the SIEM workflows a real operations centre runs on.", length: "3 months", level: "Job-ready", track: "Cyber", image: "/home-glydi/cards/soc.jpg" },
] as const;

const TABS: [Track, string][] = [["All", "All programs"], ["AI", "AI track"], ["Cyber", "Cyber security"]];

export function ProgramCards({ initial = "All" }: { initial?: Track }) {
  const [track, setTrack] = useState<Track>(initial);
  const shown = CARDS.filter(card => track === "All" || card.track === track);
  return <LayoutGroup>
    <div className="ox-filter" role="tablist" aria-label="Filter programs" data-reveal>
      {TABS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={track === key} className={track === key ? "is-on" : ""} onClick={() => setTrack(key)}>
        {track === key && <motion.i layoutId="ox-filter-pill" className="ox-filter-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
        <span>{label}</span>
      </button>)}
    </div>
    <motion.div layout className={`ox-programs${shown.length === 5 ? " is-5" : ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {shown.map((card, i) => <motion.article key={card.slug} layout initial={{ opacity: 0, y: 30, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: .95 }} transition={{ duration: .6, ease: [.22, 1, .36, 1], delay: i * .05 }} className="ox-program ox-spot">
          <Link to={`/programs/${card.slug}`} className="ox-program-media" tabIndex={-1} aria-hidden="true">
            <img src={card.image} alt="" loading="lazy" decoding="async" />
            <span className={`ox-badge${card.track === "Cyber" ? " is-cyber" : ""}`}>{card.badge}</span>
            <span className="ox-program-len">{card.length}</span>
          </Link>
          <div className="ox-program-body">
            <span className="ox-num">{card.track === "AI" ? "AI TRACK" : "CYBER TRACK"}</span>
            <h3><Link to={`/programs/${card.slug}`}>{card.name}</Link></h3>
            <p>{card.text}</p>
            <div className="ox-program-foot"><span>Starts from: <b>{card.level}</b></span><Link className="ox-arrow" to={`/programs/${card.slug}`} aria-label={`View ${card.name}`}><ArrowUpRight size={18} /></Link></div>
          </div>
        </motion.article>)}
      </AnimatePresence>
    </motion.div>
  </LayoutGroup>;
}

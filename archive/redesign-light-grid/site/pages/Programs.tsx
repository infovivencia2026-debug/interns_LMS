import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Code2, Layers, Radio, Sprout } from "lucide-react";
import { ApplyButton, Cta, Head, Label, PageHero, SiteLayout } from "../Site";
import "./pages.css";

type Program = { n: string; badge: string; name: string; text: string; ticks: string[]; length: string; level: string; to: string; image: string };

const ai: Program[] = [
  { n: "01", badge: "New", name: "AI Career Accelerator", text: "Twenty-one live sessions, an hour a day. Start at zero and finish with one real product deployed under your own name.", ticks: ["21 live sessions, one hour a day", "One shipped product to show", "Built for a complete beginner"], length: "21 days", level: "Beginner", to: "/programs/aica", image: "/home-glydi/cards/aica.jpg" },
  { n: "02", badge: "Flagship", name: "AI Generalist", text: "The flagship. An AI website, an automation system and your own domain agent, all built, deployed and yours to show.", ticks: ["5 working AI systems", "7+ real, deployed projects", "Mentorship in three languages"], length: "3 months", level: "Flagship", to: "/programs/ai-generalist", image: "/home-glydi/cards/generalist.jpg" },
  { n: "03", badge: "Advanced", name: "AI Architect", text: "For people who already build. Multi-agent workflows, RAG pipelines and the orchestration that keeps them running in production.", ticks: ["Multi-agent systems and RAG", "Production-grade architecture", "Six months, project-led"], length: "6 months", level: "Advanced", to: "/programs/ai-architect", image: "/home-glydi/cards/architect.jpg" },
];
const cyber: Program[] = [
  { n: "04", badge: "Foundation", name: "Cyber Security", text: "The fundamentals every security role is built on: networks, systems and threats, taught through hands-on labs from week one.", ticks: ["Labs from the first week", "Networks, systems and threats", "No prior security background"], length: "6 months", level: "No prior", to: "/programs/cybersecurity", image: "/home-glydi/cards/cyber.jpg" },
  { n: "05", badge: "Career track", name: "SOC Analyst", text: "Train for the seat itself: detection, triage and response on the same SIEM workflows a real operations centre runs on.", ticks: ["Detection, triage and response", "Real SIEM tooling and alerts", "Structured around the job"], length: "3 months", level: "Job-ready", to: "/programs/soc-analyst", image: "/home-glydi/cards/soc.jpg" },
];

const how = [
  [Radio, "Live, not recorded", "A mentor is in the room, so questions get answered the day you have them."],
  [Code2, "Project-first", "The curriculum is a sequence of things you ship, not chapters you read."],
  [Layers, "A portfolio with links", "You finish with deployed work hiring teams and clients can actually click."],
  [Sprout, "Start from zero", "No coding background needed; the tools do the lifting while you learn the judgement."],
] as const;

function Card({ p }: { p: Program }) {
  return <article className="pr-card">
    <Link to={p.to} className="pr-card-media" tabIndex={-1} aria-hidden="true"><img src={p.image} alt="" loading="lazy" decoding="async" /><span className="lg-chip tl"><b />{p.badge}</span></Link>
    <div className="pr-card-body">
      <span className="lg-num">{p.n}/05</span>
      <h3><Link to={p.to}>{p.name}</Link></h3>
      <p>{p.text}</p>
      <ul className="lg-ticks">{p.ticks.map(t => <li key={t}>{t}</li>)}</ul>
      <div className="pr-card-foot">
        <div><strong>{p.length}</strong><span>Length</span></div>
        <div><strong>{p.level}</strong><span>Starts from</span></div>
        <Link className="lg-btn" to={p.to}>View program <ArrowUpRight size={16} /></Link>
      </div>
    </div>
  </article>;
}

export default function Programs() {
  return <SiteLayout seo={{ title: "Programs · ONROL", description: "Explore ONROL's two tracks — AI Programs and Cyber Security Programs at India's AI Execution School.", path: "/programs" }}>
    <PageHero label="Programs" title={<>Five programs. <em>Two tracks.</em></>} lede="Live, mentor-led and project-first. Pick the one that matches where you are; every one of them ends with something deployed under your own name." side={<div className="lg-actions"><ApplyButton /><Link className="lg-btn ghost" to="/tools/ai-skills-quiz">Find my program</Link></div>} />

    <section className="lg-section">
      <div className="lg-wrap">
        <div className="pr-track" id="ai">
          <div className="pr-track-head"><Label>The AI track</Label><h2>From your first build to <em>production systems.</em></h2><p>Three programs that take you from your very first working build to production-grade systems.</p></div>
          <div className="pr-cards three">{ai.map(p => <Card key={p.n} p={p} />)}</div>
        </div>
        <div className="pr-track" id="cyber">
          <div className="pr-track-head"><Label>The cyber security track</Label><h2>Secure what <em>everyone else builds.</em></h2><p>Two programs for the other half of the job: securing the systems everyone else is busy building.</p></div>
          <div className="pr-cards">{cyber.map(p => <Card key={p.n} p={p} />)}</div>
        </div>
      </div>
    </section>

    <section className="lg-section lg-wash">
      <div className="lg-wrap">
        <Head label="How every program runs" title={<>Same promise, <em>whichever you choose.</em></>}>Every ONROL program is built on the same four ideas.</Head>
        <div className="lg-bento cols-4">{how.map(([Icon, title, text]) => <div key={title} className="lg-cell-hover"><span className="lg-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></div>)}</div>
        <div className="pr-help" style={{ marginTop: 28 }}>
          <div><Label>Not sure where to start?</Label><h2>Let us point you at the right one.</h2><p>Take the sixty-second quiz and we will point you at the program that fits where you are now, or talk it through with us before you commit to anything. There is a free 90-minute masterclass before any paid commitment.</p></div>
          <div className="lg-actions"><Link className="lg-btn orange" to="/tools/ai-skills-quiz">Take the 60-second quiz <ArrowRight size={17} /></Link><Link className="lg-btn ghost" to="/contact">Talk to us</Link></div>
        </div>
      </div>
    </section>

    <Cta title={<>Your next build <em>starts here.</em></>} actions={<><ApplyButton className="lg-btn orange">Apply now</ApplyButton><Link className="lg-btn ghost" to="/masterclass">Free masterclass</Link></>}>Apply in twenty seconds. Our team calls you back about the fit, the next cohort date and the fee. No payment at the application step.</Cta>
  </SiteLayout>;
}

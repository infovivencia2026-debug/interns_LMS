import { Link } from "react-router-dom";
import { ArrowRight, Code2, Layers, Radio, Sprout } from "lucide-react";
import { ApplyButton, Cta, Head, Lines, PageHero, SiteLayout } from "../Site";
import { ProgramCards, type Track } from "../ProgramCards";

const how = [
  [Radio, "Live, not recorded", "A mentor is in the room, so questions get answered the day you have them."],
  [Code2, "Project-first", "The curriculum is a sequence of things you ship, not chapters you read."],
  [Layers, "A portfolio with links", "You finish with deployed work hiring teams and clients can actually click."],
  [Sprout, "Start from zero", "No coding background needed; the tools do the lifting while you learn the judgement."],
] as const;

const SEO_BY_TRACK = {
  All: { title: "Programs · ONROL", description: "Explore ONROL's two tracks — AI Programs and Cyber Security Programs at India's AI Execution School.", path: "/programs" },
  AI: { title: "AI Programs · ONROL", description: "ONROL's AI track — the AI Career Accelerator, AI Generalist and AI Architect programs.", path: "/programs/ai" },
  Cyber: { title: "Cyber Security Programs · ONROL", description: "ONROL's Cyber Security track — the Cyber Security and SOC Analyst programs.", path: "/programs/cyber" },
};

export default function Programs({ track = "All" }: { track?: Track }) {
  return <SiteLayout seo={SEO_BY_TRACK[track]}>
    <PageHero eyebrow="Programs" crumbs={[["/", "Home"], ["/programs", "Programs"]]} title={<Lines><>Five programs.</><em>Two tracks.</em></Lines>} lede="Live, mentor-led and project-first. Pick the one that matches where you are; every one of them ends with something deployed under your own name." side={<div className="ox-actions"><ApplyButton /><Link className="ox-btn is-ghost" to="/tools/ai-skills-quiz">Find my program</Link></div>} />

    <section className="ox-sec is-cream">
      <div className="ox-wrap">
        <Head split eyebrow="Choose your track" title={<>From your first build to <em>production systems.</em></>}>Three AI programs take you from your very first working build to production-grade systems. Two cyber security programs cover the other half of the job: securing what everyone else builds.</Head>
        <ProgramCards key={track} initial={track} />
      </div>
    </section>

    <section className="ox-sec">
      <div className="ox-wrap">
        <Head center eyebrow="How every program runs" title={<>Same promise, <em>whichever you choose.</em></>}>Every ONROL program is built on the same four ideas.</Head>
        <div className="ox-grid c4">{how.map(([Icon, title, text]) => <article key={title} className="ox-card ox-spot" data-reveal><span className="ox-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="ox-sec is-tight is-cream">
      <div className="ox-wrap ox-split">
        <div data-reveal="left">
          <Head eyebrow="Not sure where to start?" title={<>Let us point you at <em>the right one.</em></>}>Take the sixty-second quiz and we point you at the program that fits where you are now, or talk it through with us first. There is a free 90-minute masterclass before any paid commitment.</Head>
          <div className="ox-actions"><Link className="ox-btn" to="/tools/ai-skills-quiz">Take the 60-second quiz <ArrowRight size={18} /></Link><Link className="ox-btn is-ghost" to="/contact">Talk to us</Link></div>
        </div>
        <figure className="ox-frame ox-parallax" data-reveal="right"><img src="/lifeatonrol/careernexus/09.webp" srcSet="/lifeatonrol/careernexus/09-small.webp 720w, /lifeatonrol/careernexus/09.webp 1600w" sizes="(max-width: 960px) 100vw, 46vw" alt="The ONROL team walking visitors through the programs" loading="lazy" decoding="async" /><figcaption className="ox-tag">Walking through the programs</figcaption></figure>
      </div>
    </section>

    <Cta title={<>Your next build <em>starts here.</em></>} actions={<><ApplyButton>Apply now</ApplyButton><Link className="ox-btn is-ghost" to="/masterclass">Free masterclass</Link></>}>Apply in twenty seconds. Our team calls you back about the fit, the next cohort date and the fee. No payment at the application step.</Cta>
  </SiteLayout>;
}

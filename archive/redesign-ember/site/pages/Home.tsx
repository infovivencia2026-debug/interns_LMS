import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Check, Code2, GraduationCap, Home as HomeIcon, Megaphone, PenTool, Rocket, Sparkles, Store, UserSearch, Users, Video, type LucideIcon } from "lucide-react";
import { organizationJsonLd, educationalOrganizationJsonLd, websiteJsonLd, localBusinessJsonLd } from "@/lib/structuredData";
import { founderJsonLd } from "@/lib/founder";
import { homeFaqJsonLd, homeVideoJsonLd } from "@/lib/homeSchema";
import { ApplyButton, CountUp, Cta, Eyebrow, Faq, Film, Head, Lines, Marquee, Rotator, SiteLayout } from "../Site";
import { ProgramCards } from "../ProgramCards";

const log = [
  ["Day 01", "The AI-driven career world"],
  ["Day 04", "Your own prompt library"],
  ["Day 16", "A personal AI assistant"],
  ["Day 17", "Your first career project"],
  ["Day 21", "Career launch day"],
];

const tools = ["ChatGPT", "Claude", "Claude Code", "Gemini", "Perplexity", "NotebookLM", "n8n", "Zapier", "Make", "Lovable", "Supabase", "Vercel", "GitHub", "Wireshark", "Nmap", "Linux", "Active Directory", "PowerShell"];

const path = [
  ["Learn", "Master the AI tools", "Get comfortable with the tools that matter: writing good prompts, working with AI agents, and a workflow that takes you from idea to a working build fast."],
  ["Build", "Real projects, not demos", "Put it to work on real projects. You build features, fix what breaks, and make things people actually use."],
  ["Launch", "Ship it to the web", "Take it live. Your project goes on the web with a real link, and you walk away with something solid for your portfolio."],
  ["Earn", "Get paid for the skill", "Freelance work, your own product, or a job, whichever fits. Learn to package what you build and get paid for it."],
];

const people: [LucideIcon, string, string][] = [
  [Code2, "Engineers", "CSE / ECE / Mech / Civil / Chem"],
  [GraduationCap, "Students", "School, undergrad and postgrad"],
  [PenTool, "Teachers & educators", "Lesson plans, quizzes, parent updates"],
  [Megaphone, "Sales & marketing", "Campaigns, outreach and content"],
  [Building2, "Real-estate agents", "Agents, brokers and their follow-ups"],
  [Rocket, "Startup founders", "Founders and first-time builders"],
  [Briefcase, "Working professionals", "Any field, any function"],
  [UserSearch, "Job-seekers", "Graduates and career switchers"],
  [Users, "Freelancers", "Freelancers and consultants"],
  [Video, "Content creators", "YouTube / Instagram / LinkedIn / X"],
  [Store, "Small business owners", "Shops, services and local trade"],
  [HomeIcon, "Returning to work", "Career breaks and homemakers"],
];

function Person({ person: [Icon, title, sub], n }: { person: [LucideIcon, string, string]; n: number }) {
  return <figure className="ox-person"><span className="ox-icon"><Icon size={22} /></span><span className="ox-num">{String(n).padStart(2, "0")}</span><figcaption><b>{title}</b><small>{sub}</small></figcaption></figure>;
}

const faqs: [string, string][] = [
  ["Do I need to know how to code?", "No, and that isn’t a marketing line. Every program starts from zero and 70–75% of the time is hands on, with a mentor in the room while you build. If you can use a laptop and follow instructions, you can do this."],
  ["Are the sessions live, or recordings?", "Live. Mentors are in the room with you, cohorts stay small enough that your questions get answered, and every session is recorded afterwards so you can go back over anything you missed."],
  ["How much time does it take each week?", "It depends on the program. The AI Career Accelerator is an hour a day for 21 days. The AI Generalist runs three months at 50+ live hours; SOC Analyst is three months at 60+. Most people do it alongside a job or college."],
  ["What do I actually walk away with?", "Deployed work under your own name: AI systems, automations, agents, chatbots or security builds, depending on the track, with live links you can send to an employer or a client. Proof, not a certificate."],
  ["Which program should I start with?", "If you have never built anything with AI, start with the 21-day AI Career Accelerator. For a career change, the AI Generalist or the SOC Analyst track. If you already build and want to lead systems, the AI Architect. Take the two-minute quiz if you would rather be pointed."],
  ["How do I join, and what does it cost?", "Apply on any program page and our team calls you back to talk through the fit, the next cohort date and the fee for that program. There is no payment at the application step."],
];

function Hero() {
  return <section className="ox-hero is-dark" data-glow>
    <div className="ox-aurora" aria-hidden="true"><i /><i /><i /></div>
    <div className="ox-grid-bg" aria-hidden="true" />
    <div className="ox-cursor-glow" aria-hidden="true" />
    <div className="ox-noise" aria-hidden="true" />
    <div className="ox-wrap">
      <div className="ox-hero-grid">
        <div>
          <span className="ox-fade-up" style={{ "--d": "60ms" } as CSSProperties}><Eyebrow>India’s AI Execution School · Hyderabad</Eyebrow></span>
          <Lines>
            <>Build your first</>
            <>AI product</>
            <em>in 21&nbsp;days.</em>
          </Lines>
          <p className="ox-lede ox-fade-up" style={{ "--d": "650ms" } as CSSProperties}>Live, mentor-led sessions, an hour a day. Start from zero and finish with something <Rotator words={["deployed", "linkable", "real", "yours"]} /> under your own name.</p>
          <div className="ox-actions ox-fade-up" style={{ "--d": "800ms" } as CSSProperties}>
            <ApplyButton>Apply for the next cohort</ApplyButton>
            <Link className="ox-btn is-ghost" to="/masterclass">Free masterclass</Link>
          </div>
          <p className="ox-hero-note ox-fade-up" style={{ "--d": "950ms" } as CSSProperties}><span><Check size={15} />No coding needed</span><span><Check size={15} />No payment to apply</span><span><Check size={15} />Taught in 3 languages</span></p>
        </div>
        <div className="ox-stage" aria-hidden="true">
          <div className="ox-toast"><span><Rocket size={18} /></span><div><b>Project deployed</b><small>Live link ready to share</small></div></div>
          <div className="ox-console"><div className="ox-console-inner">
            <div className="ox-console-bar"><i /><i /><i /><span>ai-career-accelerator / build-log</span><b>LIVE</b></div>
            <ol className="ox-log">{log.map(([day, text], i) => <li key={day} className={i === log.length - 1 ? "is-live" : ""} style={{ "--i": i } as CSSProperties}><small>{day}</small><strong>{text}</strong><em>{i === log.length - 1 ? "LAUNCH" : <Check size={13} strokeWidth={3} />}</em></li>)}</ol>
            <div className="ox-progress"><div><span>Cohort progress</span><b>21 / 21 sessions</b></div><span><i /></span></div>
          </div></div>
          <figure className="ox-stage-photo"><img src="/lifeatonrol/khammam/01-small.webp" alt="" loading="eager" decoding="async" /><figcaption>ONROL workshop · Khammam</figcaption></figure>
        </div>
      </div>
      <dl className="ox-facts ox-fade-up" style={{ "--d": "1100ms" } as CSSProperties}>
        <div><dt>Format</dt><dd>Live & mentor-led</dd></div>
        <div><dt>Commitment</dt><dd>1 hour a day</dd></div>
        <div><dt>Prerequisites</dt><dd>None, start at zero</dd></div>
        <div><dt>You leave with</dt><dd>Deployed, linkable work</dd></div>
      </dl>
    </div>
  </section>;
}

function Journey() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: .4 });
  const [active, setActive] = useState(0);
  useEffect(() => scrollYProgress.on("change", v => setActive(Math.min(path.length - 1, Math.floor(v * path.length + .15)))), [scrollYProgress]);
  return <section className="ox-sec">
    <div className="ox-wrap ox-journey">
      <div className="ox-journey-say" data-reveal>
        <Eyebrow>The difference</Eyebrow>
        <h2 style={{ marginTop: 20 }}>Most AI courses teach tools. <em>ONROL teaches execution.</em></h2>
        <p className="ox-lede">You’ve watched enough tutorials. Come build instead: learn AI hands on and finish real projects you’ll actually want to show people.</p>
        <div className="ox-actions"><ApplyButton className="ox-btn is-ink">Apply now</ApplyButton><Link className="ox-link" to="/tools/ai-skills-quiz">Not sure? Take the 2-minute quiz <ArrowRight size={16} /></Link></div>
      </div>
      <ol className="ox-steps" ref={list}>
        <span className="ox-steps-rail" aria-hidden="true"><motion.i style={{ scaleY }} /></span>
        {path.map(([step, title, text], i) => <li key={step} className={`ox-step${i <= active ? " is-active" : ""}`}>
          <span className="ox-step-dot">0{i + 1}</span>
          <div className="ox-step-k">{step}</div>
          <h3>{title}</h3>
          <p>{text}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}

export default function Home() {
  return <SiteLayout seo={{ title: "ONROL - India's AI Execution School", description: "ONROL is India's AI Execution School. Stop watching tutorials and start building — master vibe coding and ship real-world AI projects for your portfolio.", path: "/", jsonLd: [organizationJsonLd(), educationalOrganizationJsonLd(), localBusinessJsonLd(), websiteJsonLd(), founderJsonLd(), homeFaqJsonLd(), homeVideoJsonLd()] }}>
    <Hero />

    <div className="ox-tools is-dark">
      <p className="ox-tools-label">The tools you’ll build with across the programs</p>
      <Marquee duration={50}>{tools.map(t => <span key={t} className="ox-chip">{t}</span>)}</Marquee>
    </div>

    <section className="ox-sec is-cream" id="programs">
      <div className="ox-wrap">
        <Head split eyebrow="Five programs, two tracks" title={<>Pick where you start. <em>Every path ends in a launch.</em></>}>Three AI programs and two in cyber security, each live, mentor-led and built around things you ship.</Head>
        <ProgramCards />
        <div className="ox-actions" style={{ marginTop: 36, justifyContent: "space-between" }} data-reveal>
          <Link className="ox-link" to="/programs">Compare all five programs <ArrowRight size={16} /></Link>
          <Link className="ox-link" to="/tools/ai-skills-quiz">Not sure? Take the 2-minute quiz <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>

    <section className="ox-sec is-tight">
      <div className="ox-wrap">
        <div className="ox-stats" data-reveal>
          <div><strong><CountUp to={5} /></strong><span>Programs across AI and cyber security</span></div>
          <div><strong><CountUp to={20} suffix="+" /></strong><span>Real projects across the programs</span></div>
          <div><strong><CountUp to={3} /></strong><span>Languages mentors teach in</span></div>
          <div><strong><CountUp to={75} suffix="%" /></strong><span>Of the time spent hands on, building</span></div>
        </div>
      </div>
    </section>

    <Journey />

    <section className="ox-sec is-dark" data-glow style={{ overflow: "hidden" }}>
      <div className="ox-cursor-glow" aria-hidden="true" />
      <div className="ox-wrap ox-film">
        <Film />
        <div data-reveal>
          <Eyebrow>Real mentors. Real builds.</Eyebrow>
          <h2 style={{ marginTop: 20 }}>Learn by building <em>real AI products.</em></h2>
          <p className="ox-lede" style={{ marginTop: 20 }}>ONROL is a live school with real mentors, not pre-recorded videos. Every week you finish something you can actually use, and by the end you have a portfolio that shows you can build.</p>
          <div className="ox-film-facts">
            <div><b>Live</b><span>Mentors in the room, never recordings</span></div>
            <div><b>Weekly</b><span>Something finished and deployed</span></div>
            <div><b>Portfolio</b><span>Links you can send to anyone</span></div>
          </div>
          <Link className="ox-link" to="/about" style={{ marginTop: 24 }}>Read the full story <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>

    <section className="ox-sec is-cream" style={{ overflow: "hidden" }}>
      <div className="ox-wrap"><Head center eyebrow="Who it’s for" title={<>Wherever you start, <em>you leave with something built.</em></>}>Twelve different places to begin. Find yours, and finish with real AI projects made for the work you actually do.</Head></div>
      <div className="ox-people" data-reveal>
        <Marquee duration={55}>{people.slice(0, 6).map((p, i) => <Person key={p[1]} person={p} n={i + 1} />)}</Marquee>
        <Marquee duration={55} reverse>{people.slice(6).map((p, i) => <Person key={p[1]} person={p} n={i + 7} />)}</Marquee>
      </div>
    </section>

    <section className="ox-sec">
      <div className="ox-wrap ox-faq-grid">
        <div data-reveal>
          <Eyebrow>Before you apply</Eyebrow>
          <h2 style={{ marginTop: 20 }}>The questions <em>we get asked most.</em></h2>
          <p className="ox-lede" style={{ marginTop: 20 }}>If yours isn’t here, ask us directly. A person answers, usually within a few hours.</p>
          <div className="ox-actions" style={{ marginTop: 28 }}><Link className="ox-btn is-ghost" to="/contact">Ask us anything <Sparkles size={17} /></Link></div>
        </div>
        <Faq items={faqs} />
      </div>
    </section>

    <Cta title={<>Stop watching. <em>Start building.</em></>} actions={<><ApplyButton>Apply now</ApplyButton><Link className="ox-btn is-ghost" to="/masterclass">Sit in on the free masterclass</Link></>}>Join the next ONROL cohort and start building from day one, with mentors in your corner instead of just another video to watch.</Cta>
  </SiteLayout>;
}

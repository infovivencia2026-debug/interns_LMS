import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Briefcase, Building2, Code2, GraduationCap, Home as HomeIcon, Megaphone, Play, PenTool, Rocket, Store, Users, UserSearch, Video } from "lucide-react";
import { organizationJsonLd, educationalOrganizationJsonLd, websiteJsonLd, localBusinessJsonLd } from "@/lib/structuredData";
import { founderJsonLd } from "@/lib/founder";
import { homeFaqJsonLd, homeVideoJsonLd } from "@/lib/homeSchema";
import { ApplyButton, Cta, Faq, Head, Label, SiteLayout, Tiles } from "../Site";
import "./pages.css";

const programs = [
  { n: "01", len: "21 days", name: "AI Career Accelerator", line: "Zero to a shipped AI product, an hour a day.", to: "/programs/aica", track: "AI" },
  { n: "02", len: "3 months", name: "AI Generalist", line: "5 AI systems, 7+ projects, one portfolio.", to: "/programs/ai-generalist", track: "AI" },
  { n: "03", len: "6 + 6 months", name: "AI Architect", line: "Design and lead systems that run in production.", to: "/programs/ai-architect", track: "AI" },
  { n: "04", len: "6 months", name: "Cyber Security", line: "How attacks work, and how you stop them.", to: "/programs/cybersecurity", track: "Cyber" },
  { n: "05", len: "3 months", name: "SOC Analyst", line: "Run a real security operations centre, end to end.", to: "/programs/soc-analyst", track: "Cyber" },
];

const path = [
  ["Learn", "Master the AI tools", "Get comfortable with the tools that matter: writing good prompts, working with AI agents, and a workflow that takes you from idea to a working build fast."],
  ["Build", "Real projects, not demos", "Put it to work on real projects. You build features, fix what breaks, and make things people actually use."],
  ["Launch", "Ship it to the web", "Take it live. Your project goes on the web with a real link, and you walk away with something solid for your portfolio."],
  ["Earn", "Get paid for the skill", "Freelance work, your own product, or a job, whichever fits. Learn to package what you build and get paid for it."],
];

const audiences = [
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
] as const;

const faqs: [string, string][] = [
  ["Do I need to know how to code?", "No, and that isn’t a marketing line. Every program starts from zero and 70–75% of the time is hands on, with a mentor in the room while you build. If you can use a laptop and follow instructions, you can do this."],
  ["Are the sessions live, or recordings?", "Live. Mentors are in the room with you, cohorts stay small enough that your questions get answered, and every session is recorded afterwards so you can go back over anything you missed."],
  ["How much time does it take each week?", "It depends on the program. The AI Career Accelerator is an hour a day for 21 days. The AI Generalist runs three months at 50+ live hours; SOC Analyst is three months at 60+. Most people do it alongside a job or college."],
  ["What do I actually walk away with?", "Deployed work under your own name: AI systems, automations, agents, chatbots or security builds, depending on the track, with live links you can send to an employer or a client. Proof, not a certificate."],
  ["Which program should I start with?", "If you have never built anything with AI, start with the 21-day AI Career Accelerator. For a career change, the AI Generalist or the SOC Analyst track. If you already build and want to lead systems, the AI Architect. Take the two-minute quiz if you would rather be pointed."],
  ["How do I join, and what does it cost?", "Apply on any program page and our team calls you back to talk through the fit, the next cohort date and the fee for that program. There is no payment at the application step."],
];

function Film() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return <div className="lg-frame hm-film">
    <video ref={video} src="/home-glydi/about_onrol.mp4" poster="/home-glydi/about-poster.webp" preload="none" playsInline controls={playing} onEnded={() => setPlaying(false)} />
    {!playing && <button type="button" className="hm-play" onClick={() => { setPlaying(true); void video.current?.play(); }}><span><Play size={22} fill="currentColor" /></span>Watch the ONROL story</button>}
  </div>;
}

export default function Home() {
  return <SiteLayout seo={{ title: "ONROL - India's AI Execution School", description: "ONROL is India's AI Execution School. Stop watching tutorials and start building — master vibe coding and ship real-world AI projects for your portfolio.", path: "/", jsonLd: [organizationJsonLd(), educationalOrganizationJsonLd(), localBusinessJsonLd(), websiteJsonLd(), founderJsonLd(), homeFaqJsonLd(), homeVideoJsonLd()] }}>
    {/* hero */}
    <section className="hm-hero">
      <div className="lg-grid lg-grid-fade hm-hero-grid" aria-hidden="true" />
      <div className="lg-wrap hm-hero-inner">
        <div className="lg-in hm-hero-copy">
          <Label>India’s AI Execution School</Label>
          <h1>Build your first AI product in <em>21&nbsp;days.</em></h1>
          <p>Live, mentor-led sessions, an hour a day. Start from zero and finish with something deployed under your own name.</p>
          <div className="lg-actions"><ApplyButton>Apply for the next cohort</ApplyButton><Link className="lg-btn ghost" to="/masterclass">Free masterclass</Link></div>
        </div>
        <div className="hm-hero-art lg-in">
          <div className="lg-frame hm-hero-photo"><img src="/lifeatonrol/khammam/01.webp" srcSet="/lifeatonrol/khammam/01-small.webp 720w, /lifeatonrol/khammam/01.webp 1600w" sizes="(max-width: 900px) 100vw, 46vw" alt="A full hall at an ONROL AI workshop in Khammam" {...{ fetchpriority: "high" }} /><span className="lg-chip tl"><b />Live · AI workshop, Khammam</span></div>
          <div className="hm-hero-tiles"><Tiles size={30} gap={7} float /></div>
          <div className="hm-hero-card"><span className="lg-num">NEXT COHORT</span><strong>Starts soon</strong><small>Limited seats · no payment to apply</small></div>
        </div>
      </div>
      <div className="lg-wrap"><dl className="hm-facts">
        <div><dt>Format</dt><dd>Live & mentor-led</dd></div>
        <div><dt>Commitment</dt><dd>1 hour a day</dd></div>
        <div><dt>Prerequisites</dt><dd>None, start at zero</dd></div>
        <div><dt>You leave with</dt><dd>Deployed, linkable work</dd></div>
      </dl></div>
    </section>

    {/* programs */}
    <section className="lg-section lg-wash" id="programs">
      <div className="lg-wrap">
        <Head label="Five programs, two tracks" title={<>Pick where you start. <em>Every path ends in a launch.</em></>}>Three AI programs and two in cyber security, each live, mentor-led and built around things you ship.</Head>
        <div className="hm-programs">
          {programs.map(p => <Link key={p.n} to={p.to} className="hm-program lg-cell-hover">
            <div className="hm-program-top"><span className="lg-num">{p.n}/05</span><span className={`hm-track ${p.track === "AI" ? "ai" : "cy"}`}>{p.track}</span></div>
            <h3>{p.name}</h3><p>{p.line}</p>
            <div className="hm-program-foot"><span>{p.len}</span><ArrowUpRight size={18} /></div>
          </Link>)}
        </div>
        <div className="hm-programs-more"><Link className="lg-link" to="/programs">Compare all five programs <ArrowRight size={16} /></Link><Link className="lg-link" to="/tools/ai-skills-quiz">Not sure? Take the 2-minute quiz <ArrowRight size={16} /></Link></div>
      </div>
    </section>

    {/* the difference + the path */}
    <section className="lg-section">
      <div className="lg-wrap">
        <Head label="The difference" title={<>Most AI courses teach tools. <em>ONROL teaches execution.</em></>}>You’ve watched enough tutorials. Come build instead: learn AI hands on and finish real projects you’ll actually want to show people.</Head>
        <div className="lg-bento cols-4 hm-path">
          {path.map(([step, title, text], i) => <article key={step} className="lg-cell-hover">
            <div className="hm-path-top"><span className="lg-num">STEP 0{i + 1}</span><Tiles size={10} gap={3} pattern={[["x", "x", "x", "x"].map((_, j) => j <= i ? "x" : ".").join("")]} ghost /></div>
            <span className="hm-path-step">{step}</span>
            <h3>{title}</h3><p>{text}</p>
          </article>)}
        </div>
      </div>
    </section>

    {/* real mentors, real builds */}
    <section className="lg-section lg-wash">
      <div className="lg-wrap hm-mentors">
        <Film />
        <div>
          <Label>Real mentors. Real builds.</Label>
          <h2 className="hm-mentors-title">Learn by building real AI products.</h2>
          <p className="mute hm-mentors-copy">ONROL is a live school with real mentors, not pre-recorded videos. Every week you finish something you can actually use, and by the end you have a portfolio that shows you can build, not just talk about it.</p>
          <div className="lg-bento cols-3 hm-mini">
            <div><strong>Live</strong><span>Mentors in the room, never recordings</span></div>
            <div><strong>Weekly</strong><span>Something finished and deployed</span></div>
            <div><strong>Portfolio</strong><span>Links you can send to anyone</span></div>
          </div>
          <Link className="lg-link" to="/about">Read the full story <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>

    {/* who it's for */}
    <section className="lg-section">
      <div className="lg-wrap">
        <Head label="Who it’s for" title={<>Wherever you start, <em>you leave with something built.</em></>}>Twelve different places to begin. Find yours, and finish with real AI projects made for the work you actually do.</Head>
        <div className="lg-bento cols-4 hm-who">
          {audiences.map(([Icon, title, sub]) => <div key={title} className="lg-cell-hover"><span className="lg-icon"><Icon size={20} /></span><h3>{title}</h3><p>{sub}</p></div>)}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="lg-section lg-wash">
      <div className="lg-wrap hm-faq">
        <div className="hm-faq-head">
          <Label>Before you apply</Label>
          <h2>The questions we get asked most.</h2>
          <p className="mute">If yours isn’t here, ask us directly. A person answers, usually within a few hours.</p>
          <Link className="lg-btn ghost" to="/contact">Ask us anything <ArrowRight size={17} /></Link>
        </div>
        <Faq items={faqs} />
      </div>
    </section>

    <Cta title={<>Stop watching. <em>Start building.</em></>} actions={<><ApplyButton className="lg-btn orange">Apply now</ApplyButton><Link className="lg-btn ghost" to="/masterclass">Sit in on the free masterclass</Link></>}>Join the next ONROL cohort and start building from day one, with mentors in your corner instead of just another video to watch.</Cta>
  </SiteLayout>;
}

import { Link } from "react-router-dom";
import { BookOpenCheck, Code2, Radio, Sprout } from "lucide-react";
import { ApplyButton, Cta, Head, Label, PageHero, SiteLayout } from "../Site";
import "./pages.css";

const why = [
  [Code2, "Project based from day one", "Every week ends with something built and deployed, not a quiz score. The curriculum is the sequence of things you ship."],
  [Radio, "Live mentors, never recordings", "Sessions are live with a practitioner in the room, so questions get answered the day you have them."],
  [BookOpenCheck, "Industry relevant curriculum", "Generative AI, agents, automation and no-code tooling, revised as the field moves. What teams are paying for now."],
  [Sprout, "Beginner friendly, no coding needed", "The tools do the heavy lifting while you learn the judgement, so a beginner and a working engineer both have somewhere to begin."],
] as const;

const values = ["Execution", "Mentorship", "Accessibility", "Accountability", "Craft"];

const timeline = [
  ["Global healthcare leadership", "Santa Clara Hospital, USA · Clinical Research, UK", "16+ years of international experience in healthcare, clinical research and statistical analysis, across clinical trials, data-driven decisions and operational excellence."],
  ["Founder, Yajur Public School", "Warangal, Telangana", "Established the school to build future-ready learners, with curricula that combine traditional values with 21st-century competencies."],
  ["Co-Founder, Vivencia Educational Services", "India", "Built programs in entrepreneurship, design thinking, financial literacy and future skills for students from Grade 3 through undergraduate, reaching thousands of learners."],
  ["Founder, ONROL", "India’s AI Execution School", "Created ONROL to bridge AI learning and real-world impact: a live cohort where every learner ships deployed AI projects and leaves able to create, not just recite."],
];

const serve = ["Students", "Working professionals", "Entrepreneurs", "Freelancers", "Business owners", "Educators", "Career switchers", "Creators", "Engineers", "Job seekers", "Real-estate agents", "Returning to work"];

const gallery = [
  ["/lifeatonrol/careernexus/01.webp", "Felicitation on stage with the TTPOC organisers, CareerNexus 3.0"],
  ["/lifeatonrol/careernexus/04.webp", "At the ONROL desk, between sessions"],
  ["/lifeatonrol/careernexus/07.webp", "Placement officers and the ONROL team"],
  ["/lifeatonrol/careernexus/09.webp", "Walking through the ONROL programs"],
  ["/lifeatonrol/careernexus/06.webp", "In the Tech Mahindra lobby"],
];

export default function About() {
  return <SiteLayout seo={{ title: "About · ONROL", description: "ONROL is India's AI Execution School — stop watching tutorials and start shipping real AI products.", path: "/about" }}>
    <PageHero label="About ONROL" title={<>India’s AI <em>Execution School.</em></>} lede="Live, mentor-led and project-first. Hyderabad based, teaching people to build with AI instead of just learning about it." side={<div className="lg-actions"><ApplyButton /><Link className="lg-btn ghost" to="/programs">Explore programs</Link></div>} />

    <section className="lg-section tight">
      <div className="lg-wrap"><div className="lg-stats">
        <div><strong>5</strong><span>Programs</span></div>
        <div><strong>20<em>+</em></strong><span>Projects</span></div>
        <div><strong>3</strong><span>Languages</span></div>
        <div><strong>100<em>%</em></strong><span>Hands on</span></div>
      </div></div>
    </section>

    <section className="lg-section" style={{ paddingTop: 0 }}>
      <div className="lg-wrap ab-over">
        <div className="lg-frame"><img src="/home-glydi/about-hero.webp" alt="An ONROL mentor guiding a learner at her laptop" loading="lazy" decoding="async" /><span className="lg-chip bl"><b />Mentor in the room</span></div>
        <div className="ab-over-copy">
          <Label>ONROL overview</Label>
          <h2>Real AI solutions, <em>not certificates.</em></h2>
          <p>ONROL is India’s AI Execution School, based in Hyderabad: a premium, project-based AI school with live mentorship, where learners build real AI solutions instead of collecting certificates for concepts they never use.</p>
          <p>Across our programs in AI and Cyber Security, students work through <strong>20+ real projects</strong>, taught live in <strong>3 languages</strong> and structured so that every week ends with something finished, deployed and worth showing.</p>
          <p>Our mentors are practitioners who have shipped real work. They sit in every session, review what you build, and stay with you from your first prompt to the moment your project goes live on the web.</p>
        </div>
      </div>
    </section>

    <section className="lg-section lg-wash">
      <div className="lg-wrap">
        <Head label="Why ONROL" title={<>Four things we <em>never compromise on.</em></>}>The reasons learners choose ONROL, and the reasons they finish.</Head>
        <div className="lg-bento cols-4">{why.map(([Icon, title, text]) => <div key={title} className="lg-cell-hover"><span className="lg-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </div>
    </section>

    <section className="lg-section lg-ink lg-grid">
      <div className="lg-wrap ab-vm">
        <div><Label>Vision & mission</Label><h2>A country of AI <em>builders,</em> not AI spectators.</h2><p>We exist to close the gap between watching tutorials and actually shipping real AI products, so every learner leaves able to create, not just recite.</p></div>
        <div className="ab-values">{values.map((v, i) => <div key={v}>{v}<span>0{i + 1}</span></div>)}</div>
      </div>
    </section>

    <section className="lg-section">
      <div className="lg-wrap ab-founder">
        <div className="ab-portrait">
          <div className="lg-frame"><img src="/home-glydi/founder-neeraja.webp" alt="Dr. Neeraja Reddy, Founder and CEO of ONROL" loading="lazy" decoding="async" /></div>
          <div className="ab-cred"><div><strong>16+</strong><span>Years</span></div><div><strong>3</strong><span>Countries</span></div><div><strong>2</strong><span>Ventures</span></div></div>
        </div>
        <div className="ab-founder-body">
          <Label>Built by an educator, for real outcomes</Label>
          <h2>Dr. Neeraja Reddy</h2>
          <span className="ab-role">Founder & CEO, ONROL</span>
          <p>Sixteen years across healthcare, clinical research and education in the USA, the UK and India, and two schools founded along the way. Dr. Neeraja Reddy built ONROL to close the gap she kept seeing in every classroom: people who had learned the theory and still could not build the thing.</p>
          <ol className="ab-timeline">{timeline.map(([title, where, text]) => <li key={title}><h3>{title}</h3><small>{where}</small><p>{text}</p></li>)}</ol>
          <blockquote className="ab-quote">“The future belongs to people who can build with AI. Our job is to get you there.”</blockquote>
        </div>
      </div>
    </section>

    <section className="lg-section lg-wash">
      <div className="lg-wrap">
        <Head label="ONROL in person" title={<>In the room <em>with the people we serve.</em></>}>From campus workshops to CareerNexus 3.0 at Tech Mahindra, Hitec City.</Head>
        <div className="ab-gallery">{gallery.map(([src, alt], i) => <figure key={src} className="lg-frame"><img src={src} srcSet={`${src.replace(".webp", "-small.webp")} 720w, ${src} 1600w`} sizes={i === 0 ? "(max-width: 760px) 100vw, 45vw" : "(max-width: 760px) 50vw, 27vw"} alt={alt} loading="lazy" decoding="async" /></figure>)}</div>
        <div style={{ marginTop: 56 }}>
          <Label>Who we serve</Label>
          <div className="lg-pills" style={{ marginTop: 20 }}>{serve.map(s => <span key={s} className="lg-pill">{s}</span>)}</div>
        </div>
      </div>
    </section>

    <Cta label="Connect with us" title={<>Start building <em>from day one.</em></>} actions={<><ApplyButton className="lg-btn orange">Apply now</ApplyButton><Link className="lg-btn ghost" to="/contact">Contact the team</Link></>}>Join the next ONROL cohort, with mentors in your corner instead of just another video to watch. Limited seats, next cohort starts soon.</Cta>
  </SiteLayout>;
}

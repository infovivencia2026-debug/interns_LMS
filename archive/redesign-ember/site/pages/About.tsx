import { Link } from "react-router-dom";
import { BookOpenCheck, Code2, Radio, Sprout } from "lucide-react";
import { ApplyButton, CountUp, Cta, Eyebrow, Head, Lines, PageHero, SiteLayout } from "../Site";

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
    <PageHero eyebrow="About ONROL" crumbs={[["/", "Home"], ["/about", "About"]]} title={<Lines><>India’s AI</><em>Execution School.</em></Lines>} lede="Live, mentor-led and project-first. Hyderabad based, teaching people to build with AI instead of just learning about it." side={<div className="ox-actions"><ApplyButton /><Link className="ox-btn is-ghost" to="/programs">Explore programs</Link></div>} />

    <section className="is-dark" style={{ paddingBottom: "clamp(56px,7vw,96px)" }}>
      <div className="ox-wrap"><div className="ox-stats" data-reveal>
        <div><strong><CountUp to={5} /></strong><span>Programs</span></div>
        <div><strong><CountUp to={20} suffix="+" /></strong><span>Real projects</span></div>
        <div><strong><CountUp to={3} /></strong><span>Teaching languages</span></div>
        <div><strong><CountUp to={100} suffix="%" /></strong><span>Live, never recorded-only</span></div>
      </div></div>
    </section>

    <section className="ox-sec">
      <div className="ox-wrap ox-split">
        <figure className="ox-frame ox-parallax" data-reveal="left"><img src="/home-glydi/about-hero.webp" alt="An ONROL mentor guiding a learner at her laptop" loading="lazy" decoding="async" /><figcaption className="ox-tag">Mentor in the room</figcaption></figure>
        <div data-reveal="right">
          <Eyebrow>ONROL overview</Eyebrow>
          <h2 style={{ margin: "20px 0 28px" }}>Real AI solutions, <em>not certificates.</em></h2>
          <div className="ox-prose">
            <p>ONROL is India’s AI Execution School, based in Hyderabad: a project-based AI school with live mentorship, where learners build real AI solutions instead of collecting certificates for concepts they never use.</p>
            <p>Across our programs in AI and Cyber Security, students work through <strong>20+ real projects</strong>, taught live in <strong>3 languages</strong> and structured so that every week ends with something finished, deployed and worth showing.</p>
            <p>Our mentors are practitioners who have shipped real work. They sit in every session, review what you build, and stay with you from your first prompt to the moment your project goes live on the web.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="ox-sec is-cream">
      <div className="ox-wrap">
        <Head split eyebrow="Why ONROL" title={<>Four things we <em>never compromise on.</em></>}>The reasons learners choose ONROL, and the reasons they finish.</Head>
        <div className="ox-grid c4">{why.map(([Icon, title, text]) => <article key={title} className="ox-card ox-spot" data-reveal><span className="ox-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="ox-sec is-dark" data-glow style={{ overflow: "hidden" }}>
      <div className="ox-cursor-glow" aria-hidden="true" />
      <div className="ox-wrap ox-split">
        <div data-reveal><Eyebrow>Vision & mission</Eyebrow><h2 style={{ marginTop: 20 }}>A country of AI <em>builders,</em> not AI spectators.</h2><p className="ox-lede" style={{ marginTop: 20 }}>We exist to close the gap between watching tutorials and actually shipping real AI products, so every learner leaves able to create, not just recite.</p></div>
        <div className="ox-values" data-reveal>{values.map((v, i) => <div key={v}>{v}<span>0{i + 1}</span></div>)}</div>
      </div>
    </section>

    <section className="ox-sec">
      <div className="ox-wrap ox-split" style={{ alignItems: "start" }}>
        <div data-reveal="left" style={{ position: "sticky", top: 110 }}>
          <figure className="ox-frame" style={{ aspectRatio: "4/4.6" }}><img src="/home-glydi/founder-neeraja.webp" alt="Dr. Neeraja Reddy, Founder and CEO of ONROL" loading="lazy" decoding="async" /><figcaption className="ox-tag">Founder & CEO</figcaption></figure>
          <div className="ox-stats" style={{ marginTop: 14 }}><div><strong><CountUp to={16} suffix="+" /></strong><span>Years</span></div><div><strong><CountUp to={3} /></strong><span>Countries</span></div></div>
        </div>
        <div data-reveal="right">
          <Eyebrow>Built by an educator, for real outcomes</Eyebrow>
          <h2 style={{ marginTop: 20 }}>Dr. Neeraja <em>Reddy</em></h2>
          <p className="ox-lede" style={{ marginTop: 20 }}>Sixteen years across healthcare, clinical research and education in the USA, the UK and India, and two schools founded along the way. Dr. Neeraja Reddy built ONROL to close the gap she kept seeing in every classroom: people who had learned the theory and still could not build the thing.</p>
          <ol className="ox-timeline">{timeline.map(([title, where, text]) => <li key={title}><h3>{title}</h3><small>{where}</small><p>{text}</p></li>)}</ol>
          <blockquote className="ox-quote">“The future belongs to people who can build with AI. Our job is to get you there.”</blockquote>
        </div>
      </div>
    </section>

    <section className="ox-sec is-cream">
      <div className="ox-wrap">
        <Head split eyebrow="ONROL in person" title={<>In the room <em>with the people we serve.</em></>}>From campus workshops to CareerNexus 3.0 at Tech Mahindra, Hitec City.</Head>
        <div className="ox-gallery">{gallery.map(([src, alt], i) => <figure key={src} className="ox-frame" data-reveal="scale"><img src={src} srcSet={`${src.replace(".webp", "-small.webp")} 720w, ${src} 1600w`} sizes={i === 0 ? "(max-width: 640px) 100vw, 64vw" : "(max-width: 640px) 50vw, 32vw"} alt={alt} loading="lazy" decoding="async" /></figure>)}</div>
        <div style={{ marginTop: 56 }} data-reveal>
          <Eyebrow>Who we serve</Eyebrow>
          <div className="ox-pills" style={{ marginTop: 20 }}>{serve.map(s => <span key={s} className="ox-pill">{s}</span>)}</div>
        </div>
      </div>
    </section>

    <Cta eyebrow="Connect with us" title={<>Start building <em>from day one.</em></>} actions={<><ApplyButton>Apply now</ApplyButton><Link className="ox-btn is-ghost" to="/contact">Contact the team</Link></>}>Join the next ONROL cohort, with mentors in your corner instead of just another video to watch.</Cta>
  </SiteLayout>;
}

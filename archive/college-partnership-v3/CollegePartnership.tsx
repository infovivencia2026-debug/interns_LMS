import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Award, Brain, Briefcase, Check, Code2, Database, FolderKanban, GraduationCap, Lightbulb, Radar, ShieldCheck, TrendingUp, Workflow, Zap } from "lucide-react";
import { PathwayLayout, Photo } from "./PathwayLayout";
import "./college-partnership.css";

/* College Partnership (preview). Each section borrows one visual metaphor:
   a bridge across the gap, puzzle pieces, a chalk path, a circle of people
   and lines converging on one outcome. */

const pillars = [
  { name: "Emerging Tech Skills", icon: Zap },
  { name: "Industry Projects", icon: FolderKanban },
  { name: "Internships & Mentorship", icon: Briefcase },
  { name: "Career Readiness", icon: TrendingUp },
];

const offerings = [
  { icon: Award, photo: "s-pt-skills", alt: "Two students studying together with notebooks and a laptop", title: "Skill Programmes & Certifications", text: "AI, cybersecurity, SOC operations, data science and emerging technologies, with structured learning and practical assessments.", tags: ["AI", "Cybersecurity", "SOC", "Data Science"] },
  { icon: Zap, photo: "s-pt-workshops", alt: "A team gathered around a table in a hands-on workshop", title: "Workshops & Bootcamps", text: "One-day and multi-day hands-on sessions, guided labs and application-building experiences." },
  { icon: Lightbulb, photo: "intl-generalist", alt: "Two people reviewing code on a laptop screen", title: "Hackathons & Innovation", text: "Campus problem-solving challenges and collaborative events that encourage students to build and present solutions." },
  { icon: FolderKanban, photo: "s-pt-projects", alt: "A mentor and a student discussing a project at a laptop", title: "Academic Project Support", text: "Guidance for mini-projects, final-year projects, development milestones, testing and project demonstrations." },
  { icon: Briefcase, photo: "s-pt-internships", alt: "Interns working with a mentor at a shared desk", title: "Internship Opportunities", text: "Role-based, mentor-supported programmes featuring hands-on tasks, workplace simulations and project portfolios." },
  { icon: TrendingUp, photo: "s-pt-career", alt: "A mentor coaching a student at a desk", title: "Career & Portfolio Readiness", text: "Resume building, proof-of-work documentation, LinkedIn presence, interview preparation and skills presentation." },
];

const focusAreas = [
  { icon: Brain, name: "Artificial Intelligence" },
  { icon: ShieldCheck, name: "Cybersecurity" },
  { icon: Radar, name: "SOC Analyst" },
  { icon: Database, name: "Data Science" },
  { icon: Workflow, name: "AI Automation" },
  { icon: Code2, name: "Applied Projects" },
];

// Decorative faces around the focus-area circle (alt="" on purpose).
const faces = ["s-pt-skills", "s-pt-projects", "s-pt-internships", "s-pt-career", "s-pt-workshops", "s-pt-gains", "s-cp-hero", "s-cp-formats", "enquire-college", "intl-hero", "intl-soc", "intl-aica"];

const statements = ["Learn the technology.", "Apply the knowledge.", "Show the work."];
const ticks = ["Live mentor-led and online learning formats", "Structured exercises and project support", "Programme-specific evaluations and certificates", "Supervised internships and career preparation"];

const models = [
  { title: "Academic Integration", photo: "s-cp-hero", text: "Semester-aligned add-on modules in AI, cybersecurity, SOC and data science." },
  { title: "Online Programmes", photo: "intl-aica", text: "Flexible learning journeys supported by ONROL’s online platform and mentors." },
  { title: "Internships & Projects", photo: "enquire-college", text: "Task-based projects, mentor reviews and documented student proof of work." },
  { title: "Campus Bootcamps", photo: "s-cp-formats", text: "Focused workshops, practical labs and intensive hands-on training." },
  { title: "Hackathons", photo: "intl-cybersecurity", text: "Challenge-driven innovation programmes and project showcases." },
];

const steps = [
  ["Discuss", "Understand your institution’s student profile and priorities."],
  ["Select", "Choose programmes, tracks and formats that fit your needs."],
  ["Plan", "Align schedules, departments, learning outcomes and logistics."],
  ["Deliver", "Run mentor-supported learning, workshops and practical activities."],
  ["Review", "Document participation, submissions and progress."],
];

const interests = ["Academic integration", "Workshops and bootcamps", "Hackathons", "Academic projects", "Internship programmes", "Career readiness", "Multiple programmes"];

const ticker = [...focusAreas.map(a => a.name), "Workshops & Bootcamps", "Hackathons", "Internships", "Career Readiness"];

function Kicker({ n, children }: { n: string; children: ReactNode }) {
  return <span className="cpx-kicker"><b>{n}</b>{children}</span>;
}

/* A small student silhouette standing with its feet at (0,0). */
function Walker({ pack = "#e4432d" }: { pack?: string }) {
  return <g>
    <rect x="-10" y="-29" width="6" height="12" rx="2" fill={pack} />
    <path className="cpx-leg" d="M-2 -13 L-4 0" />
    <path className="cpx-leg is-b" d="M2 -13 L5 0" />
    <path d="M-6 -30 Q0 -33 6 -30 L7 -12 L-7 -12 Z" fill="currentColor" />
    <circle cy="-37" r="5.5" fill="currentColor" />
  </g>;
}

const leaf = "M0 0 C18 -26 52 -40 86 -34 C60 -12 30 -2 0 0 Z";

function BridgeScene() {
  return <svg className="cpx-scene" viewBox="0 0 640 560" role="img" aria-label="A pen draws a bridge across the gap between academic learning and industry, and students walk across it">
    <defs>
      <linearGradient id="cpx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#aecbec" /><stop offset=".62" stopColor="#e4eefa" /><stop offset="1" stopColor="#f4f8fd" /></linearGradient>
      <radialGradient id="cpx-sun"><stop offset="0" stopColor="#fff8e2" /><stop offset=".35" stopColor="#fff3d0" stopOpacity=".85" /><stop offset="1" stopColor="#fff3d0" stopOpacity="0" /></radialGradient>
      <linearGradient id="cpx-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#66748c" /><stop offset=".5" stopColor="#3f4b63" /><stop offset="1" stopColor="#202a40" /></linearGradient>
      <linearGradient id="cpx-pen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0a1a40" /><stop offset=".4" stopColor="#2f56b0" /><stop offset=".6" stopColor="#24459a" /><stop offset="1" stopColor="#081636" /></linearGradient>
      <linearGradient id="cpx-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8d99aa" /><stop offset=".45" stopColor="#f4f7fb" /><stop offset="1" stopColor="#7b8798" /></linearGradient>
    </defs>
    <rect width="640" height="560" fill="url(#cpx-sky)" />
    <circle cx="480" cy="112" r="120" fill="url(#cpx-sun)" />
    <g className="cpx-clouds" fill="#fff">
      <g opacity=".95"><ellipse cx="110" cy="118" rx="62" ry="17" /><ellipse cx="140" cy="104" rx="36" ry="19" /><ellipse cx="96" cy="108" rx="26" ry="14" /></g>
      <g opacity=".75"><ellipse cx="420" cy="196" rx="54" ry="13" /><ellipse cx="444" cy="185" rx="28" ry="14" /></g>
      <g opacity=".6"><ellipse cx="270" cy="64" rx="40" ry="10" /><ellipse cx="284" cy="57" rx="20" ry="10" /></g>
    </g>
    <path d="M0 408 L70 352 L140 388 L230 306 L318 372 L412 312 L506 362 L640 318 V560 H0 Z" fill="#cddcef" />
    <path d="M0 450 L96 408 L200 438 L320 398 L436 436 L540 404 L640 430 V560 H0 Z" fill="#bccfe8" />
    <g fill="#a6bfdf">
      <rect x="232" y="470" width="20" height="90" /><rect x="256" y="444" width="14" height="116" /><rect x="274" y="486" width="26" height="74" />
      <path d="M304 560 V480 Q320 452 336 480 V560 Z" /><rect x="340" y="452" width="12" height="108" /><rect x="356" y="478" width="22" height="82" />
      <circle cx="398" cy="478" r="20" fill="none" stroke="#a6bfdf" strokeWidth="3" /><rect x="396" y="478" width="4" height="82" />
    </g>
    <path d="M0 560 V352 H214 L206 380 L220 412 L202 446 L214 486 L196 524 L204 560 Z" fill="url(#cpx-rock)" />
    <path d="M214 352 L206 380 L220 412 L202 446 L214 486 L196 524 L204 560 H176 L188 522 L172 480 L190 440 L176 404 L188 374 Z" fill="#141c30" opacity=".45" />
    <path d="M0 352 H120 L90 390 L60 372 L20 420 L0 404 Z" fill="#fff" opacity=".08" />
    <path d="M640 560 V352 H426 L434 380 L420 412 L438 446 L426 486 L444 524 L436 560 Z" fill="url(#cpx-rock)" />
    <path d="M426 352 L434 380 L420 412 L438 446 L426 486 L444 524 L436 560 H466 L452 520 L470 478 L452 440 L466 402 L452 372 Z" fill="#fff" opacity=".07" />
    <rect x="0" y="342" width="218" height="12" rx="3" fill="#e4432d" />
    <rect x="422" y="342" width="218" height="12" rx="3" fill="#e4432d" />
    {/* the bridge, drawn by the pen */}
    <line className="cpx-planks" x1="220" y1="351" x2="420" y2="351" />
    <line className="cpx-bridge" x1="218" y1="345" x2="422" y2="345" pathLength={1} />
    <g className="cpx-pen-move">
      <g transform="translate(218 343) rotate(-38)">
        <path d="M0 0 L-11 -32 H11 Z" fill="url(#cpx-metal)" />
        <path d="M0 0 L-2.5 -8 H2.5 Z" fill="#1a2640" />
        <rect x="-13" y="-52" width="26" height="21" rx="2" fill="url(#cpx-metal)" />
        <rect x="-15" y="-330" width="30" height="282" rx="15" fill="url(#cpx-pen)" />
        <rect x="-15" y="-214" width="30" height="9" fill="url(#cpx-metal)" />
        <rect x="11" y="-318" width="7" height="120" rx="3.5" fill="url(#cpx-metal)" />
        <rect x="-8" y="-318" width="4" height="250" rx="2" fill="#fff" opacity=".22" />
      </g>
    </g>
    {/* pins */}
    {[110, 530].map(x => <g key={x} className="cpx-pin" transform={`translate(${x} 312)`}><path d="M0 0 C-11 -13 -13 -20 -13 -26 A13 13 0 0 1 13 -26 C13 -20 11 -13 0 0 Z" fill="#e4432d" /><circle cy="-26" r="5" fill="#fff" /></g>)}
    {/* students crossing */}
    {["#e4432d", "#2c4f9e", "#e4432d", "#f3a03d"].map((pack, i) => <g key={i} className="cpx-walker" style={{ "--w": i } as CSSProperties}><g transform="translate(0 342) scale(1.35)"><Walker pack={pack} /></g></g>)}
    {/* foreground leaves */}
    <g className="cpx-leaves" transform="translate(-6 566)">
      <path d={leaf} fill="#e4432d" transform="rotate(-62) scale(1.25)" /><path d={leaf} fill="#1d3f8a" transform="rotate(-38) scale(1.1)" /><path d={leaf} fill="#c0331d" transform="rotate(-82) scale(.95)" /><path d={leaf} fill="#2c4f9e" transform="rotate(-16) scale(.8)" />
    </g>
    <g className="cpx-leaves" transform="translate(646 566) scale(-1 1)">
      <path d={leaf} fill="#1d3f8a" transform="rotate(-60) scale(1.2)" /><path d={leaf} fill="#2c4f9e" transform="rotate(-34) scale(1)" /><path d={leaf} fill="#e4432d" transform="rotate(-80) scale(.85)" />
    </g>
  </svg>;
}

function RegisterForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const v = new FormData(event.currentTarget);
    const message = ["Hello ONROL, I’d like to register our institution’s partnership interest.", `Institution: ${v.get("institution")}`, `Contact: ${v.get("contact")}`, `Email: ${v.get("email")}`, `Phone / WhatsApp: ${v.get("phone")}`, `City / State: ${v.get("city") || "—"}`, `Interest: ${v.get("interest")}`].join("\n");
    window.open(`https://wa.me/918121306701?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSent(true);
  }
  return <form className="cpx-form sx-r" onSubmit={submit}>
    <h3>Register Partnership Interest</h3>
    <p>Share your institution’s details to prepare a partnership enquiry.</p>
    <div className="cpx-fields">
      <label className="is-full">College / Institution Name<input name="institution" required maxLength={180} placeholder="Your college or institution" /></label>
      <label>Contact Person & Designation<input name="contact" required maxLength={140} autoComplete="name" placeholder="e.g. Dr. A. Rao, Principal" /></label>
      <label>Official Email Address<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@college.edu.in" /></label>
      <label>Phone / WhatsApp<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91" /></label>
      <label>City / State<input name="city" maxLength={120} placeholder="e.g. Hyderabad, Telangana" /></label>
      <label className="is-full">Programme of Interest<select name="interest" required defaultValue=""><option value="" disabled>Choose programme of interest</option>{interests.map(i => <option key={i}>{i}</option>)}</select></label>
    </div>
    <button className="cpx-btn" type="submit">Register Interest <ArrowRight size={17} /></button>
    {sent
      ? <p className="cpx-form-ok" role="status"><Check size={16} /> WhatsApp has opened with your enquiry, ready to review and send.</p>
      : <p className="cpx-form-note">Opens WhatsApp with your enquiry ready to review and send. <Link to="/privacy-policy">Privacy policy</Link></p>}
  </form>;
}

export default function CollegePartnership() {
  const [model, setModel] = useState(0);
  return <PathwayLayout seo={{ title: "College Partnership | ONROL AI Execution School", description: "Partner with ONROL to bring practical AI and cybersecurity skills, hands-on projects, internship programmes and career readiness support to your college.", path: "/college-partnership" }}>
    <div className="cpx">
      {/* hero: we bridge the gap */}
      <section className="cpx-hero">
        <div className="cpx-wrap cpx-hero-grid">
          <div className="cpx-hero-copy">
            <span className="cpx-badge"><i />ONROL × Higher Education</span>
            <h1><span className="cpx-script">Empowering Colleges.</span> Building <u>Industry-Ready</u> Talent.</h1>
            <p>Bridge the gap between academic learning and industry expectations through practical AI and cybersecurity skills, hands-on projects, internship programmes and career readiness support.</p>
            <div className="cpx-actions">
              <a className="cpx-btn" href="#register">Explore a Partnership <ArrowRight size={17} /></a>
              <a className="cpx-btn is-ghost" href="#programmes">Discover Our Programmes <ArrowDown size={16} /></a>
            </div>
            <ul className="cpx-hero-pillars">{pillars.map(p => <li key={p.name}><Check size={14} strokeWidth={3} />{p.name}</li>)}</ul>
          </div>
          <div className="cpx-hero-art">
            <div className="cpx-stage">
              <BridgeScene />
              <span className="cpx-tag is-left">Academic learning</span>
              <span className="cpx-tag is-right">Industry expectations</span>
            </div>
            <div className="cpx-float is-one"><span><Check size={15} strokeWidth={3} /></span>Practical Skill Programmes</div>
            <div className="cpx-float is-two"><span><FolderKanban size={15} /></span>Real Project Portfolios</div>
          </div>
        </div>
      </section>

      {/* ticker */}
      <div className="cpx-ticker" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{ticker.map(t => <em key={t}>{t}<i>✦</i></em>)}</span>)}</div></div>

      {/* pillars as interlocking puzzle pieces */}
      <section className="cpx-puzzle">
        <div className="cpx-wrap">
          <div className="cpx-head is-split sx-r">
            <div><Kicker n="01">Partner · Ship</Kicker><h2>Four pieces that <em>fit together.</em></h2></div>
            <p>Emerging tech skills, industry projects, internships and mentorship, and career readiness: one partnership that connects every piece of the student journey.</p>
          </div>
          <ol className="cpx-pieces sx-r">{pillars.map(({ name, icon: Icon }, i) => <li key={name} style={{ "--i": i } as CSSProperties}>
            <b>0{i + 1}</b><span className="cpx-piece-icon"><Icon size={22} aria-hidden="true" /></span><span className="cpx-piece-name">{name}</span>
          </li>)}</ol>
        </div>
      </section>

      {/* what we bring */}
      <section className="cpx-section" id="programmes">
        <div className="cpx-wrap">
          <div className="cpx-head is-split sx-r">
            <div><Kicker n="02">What we bring to your campus</Kicker><h2>One partnership. <em>Multiple pathways</em> to student growth.</h2></div>
            <p>Flexible industry-focused initiatives designed to complement college curricula and help students convert theory into practical capability.</p>
          </div>
          <div className="cpx-bento">{offerings.map(({ icon: Icon, photo, alt, title, text, tags }, i) => <article key={title} className={`cpx-offer sx-r${i === 0 ? " is-a" : i === 1 ? " is-b" : i === offerings.length - 1 ? " is-wide" : ""}`}>
            <figure><Photo src={`/pathways/${photo}.webp`} alt={alt} sizes={i === 0 || i === offerings.length - 1 ? "(max-width: 1000px) 100vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 34vw"} /></figure>
            <div className="cpx-offer-body">
              <span className="cpx-icon"><Icon size={21} /></span>
              <h3>{title}</h3><p>{text}</p>
              {tags && <div className="cpx-tags">{tags.map(t => <span key={t}>{t}</span>)}</div>}
              {i === offerings.length - 1 && <a className="cpx-link" href="#register">Plan this for your students <ArrowUpRight size={16} /></a>}
            </div>
          </article>)}</div>
        </div>
      </section>

      {/* beyond classrooms: the chalk path */}
      <section className="cpx-chalk">
        <div className="cpx-wrap cpx-chalk-grid">
          <div className="sx-r">
            <Kicker n="03">Skills that go beyond classrooms</Kicker>
            <h2 className="cpx-statements">{statements.map((s, i) => <span key={s}><i>0{i + 1}</i>{s}</span>)}</h2>
            <p className="cpx-lede">Our programmes combine guided instruction with applied tasks and portfolio-building opportunities, making practical evidence of learning central to the experience.</p>
            <ul className="cpx-ticks">{ticks.map(t => <li key={t}><Check size={15} strokeWidth={3} />{t}</li>)}</ul>
          </div>
          <div className="cpx-chalk-art sx-r" aria-hidden="true">
            <svg viewBox="0 0 560 520">
              <defs>
                <filter id="cpx-chalky"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="9" /></filter>
              </defs>
              <g className="cpx-dust">{[[60, 120], [140, 60], [380, 420], [470, 300], [250, 470], [90, 300], [520, 210], [320, 80]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />)}</g>
              <path className="cpx-chalk-line" d="M20 510 C150 430 210 370 290 290 S440 120 540 30" pathLength={1} filter="url(#cpx-chalky)" />
              <path className="cpx-chalk-line is-thin" d="M20 510 C150 430 210 370 290 290 S440 120 540 30" pathLength={1} filter="url(#cpx-chalky)" />
              {[[118, 446, "Learn"], [292, 288, "Apply"], [458, 104, "Show"]].map(([x, y, word], i) => <g key={word} className="cpx-stop" transform={`translate(${x} ${y})`} style={{ "--i": i } as CSSProperties}>
                <circle className="cpx-stop-ring" r="34" /><circle r="25" /><text className="cpx-stop-num" y="6" textAnchor="middle">0{i + 1}</text>
                <text className="cpx-stop-word" x={i === 2 ? -48 : 48} y="8" textAnchor={i === 2 ? "end" : "start"}>{word}</text>
              </g>)}
              <g className="cpx-chalk-people">
                <g transform="translate(66 468) scale(1.55)"><Walker pack="#f3e45d" /></g>
                <g transform="translate(218 352) scale(1.3)"><Walker pack="#f3e45d" /></g>
                <g transform="translate(372 210) scale(1.1)"><Walker pack="#f3e45d" /></g>
                <g transform="translate(510 66) scale(.9)"><Walker pack="#f3e45d" /></g>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* focus areas: a circle of people */}
      <section className="cpx-section cpx-community">
        <div className="cpx-wrap cpx-community-grid">
          <div className="cpx-community-copy sx-r">
            <Kicker n="04">Focus areas</Kicker>
            <h2>Future-facing programmes for <em>today’s students.</em></h2>
            <ul className="cpx-area-list">{focusAreas.map(({ icon: Icon, name }) => <li key={name}><Icon size={17} />{name}</li>)}</ul>
            <a className="cpx-btn" href="#register">Explore a Partnership <ArrowRight size={17} /></a>
          </div>
          <div className="cpx-cluster sx-r" aria-hidden="true">
            <span className="cpx-orbit" /><span className="cpx-orbit is-outer" />
            {faces.map((f, i) => <img key={f} className={`cpx-face${i % 2 ? " is-small" : ""}`} style={{ "--a": `${i * 30 + 15}deg` } as CSSProperties} src={`/pathways/${f}-sm.webp`} alt="" loading="lazy" decoding="async" />)}
            {focusAreas.map(({ icon: Icon, name }, i) => <div key={name} className="cpx-bubble" style={{ "--a": `${i * 60 - 90}deg` } as CSSProperties}><Icon size={22} /><span>{name}</span></div>)}
            <div className="cpx-core"><GraduationCap size={30} /><b>06</b><span>Focus areas</span></div>
          </div>
        </div>
      </section>

      {/* delivery models */}
      <section className="cpx-section is-sky" id="delivery">
        <div className="cpx-wrap">
          <div className="cpx-head is-split sx-r">
            <div><Kicker n="05">Flexible collaboration</Kicker><h2>Choose a delivery model that works for <em>your institution.</em></h2></div>
            <p>Partner on a single programme or combine multiple initiatives across departments and student groups.</p>
          </div>
          <div className="cpx-models sx-r">
            <div className="cpx-model-list" role="tablist" aria-label="Delivery models">{models.map((m, i) => <button key={m.title} type="button" role="tab" aria-selected={model === i} className={model === i ? "is-on" : ""} onClick={() => setModel(i)} onMouseEnter={() => setModel(i)}>
              <small>0{i + 1}</small><b>{m.title}</b><span className="cpx-model-mobile">{m.text}</span><ArrowRight size={18} />
            </button>)}</div>
            <div className="cpx-model-detail" role="tabpanel" key={model}>
              <Photo className="cpx-model-photo" src={`/pathways/${models[model].photo}.webp`} sizes="(max-width: 900px) 100vw, 52vw" />
              <span className="cpx-model-num">0{model + 1}</span>
              <small>MODEL 0{model + 1} of 05</small>
              <h3>{models[model].title}</h3>
              <p>{models[model].text}</p>
              <a className="cpx-btn" href="#register">Discuss this model <ArrowRight size={17} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* process: five steps converging on one outcome */}
      <section className="cpx-section cpx-process" id="process">
        <div className="cpx-wrap">
          <div className="cpx-head sx-r"><Kicker n="06">Simple partnership process</Kicker><h2>From the first conversation to <em>real learning outcomes.</em></h2></div>
          <div className="cpx-converge sx-r">
            <ol className="cpx-steps">{steps.map(([title, text], i) => <li key={title}><b>0{i + 1}</b><div><h4>{title}</h4><p>{text}</p></div></li>)}</ol>
            <div className="cpx-fan" aria-hidden="true">
              <svg viewBox="0 0 600 520" preserveAspectRatio="none">
                {steps.flatMap((_, i) => [-18, -6, 6, 18].map(o => {
                  const y = 52 + i * 104 + o;
                  return <path key={`${i}${o}`} d={`M0 ${y} C220 ${y} 300 260 440 260`} pathLength={1} style={{ "--d": `${i * 0.12 + (o + 18) * 0.004}s` } as CSSProperties} />;
                }))}
                <path className="is-out" d="M440 260 H600" pathLength={1} />
              </svg>
              <div className="cpx-seer">
                <span>Real learning outcomes</span>
                <svg viewBox="0 0 90 130"><path d="M24 80h7v48h-7zM33 80h7v48h-7zM20 42q12-7 24 0v40H20z" /><circle cx="32" cy="27" r="9" /><path d="M38 22l30-9 2 6-30 9z" /><path d="M42 46l10-20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path className="is-shadow" d="M20 128h70l-8 2H22z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* register */}
      <section className="cpx-cta" id="register">
        <div className="cpx-wrap cpx-cta-grid">
          <div className="sx-r">
            <Kicker n="07">Partner with ONROL</Kicker>
            <h2>Let’s build a <span>future-ready campus</span> together.</h2>
            <p>Bring practical technology learning, internships, hackathons and career readiness opportunities to your institution. Register your interest and explore a programme partnership tailored to your students.</p>
            <svg className="cpx-cta-bridge" viewBox="0 0 420 70" aria-hidden="true">
              <rect x="0" y="40" width="120" height="30" fill="#24324f" /><rect x="0" y="36" width="122" height="6" rx="2" fill="#e4432d" />
              <rect x="300" y="40" width="120" height="30" fill="#24324f" /><rect x="298" y="36" width="122" height="6" rx="2" fill="#e4432d" />
              <line x1="122" y1="39" x2="298" y2="39" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              {[150, 205, 260].map((x, i) => <g key={x} className="cpx-cta-walker" color="#fff" transform={`translate(${x} 37)`}><Walker pack={i === 1 ? "#f3a03d" : "#e4432d"} /></g>)}
            </svg>
            <div className="cpx-contact"><a href="https://onrol.in">www.onrol.in</a><span aria-hidden="true">•</span><a href="mailto:info@onrol.in">info@onrol.in</a></div>
          </div>
          <RegisterForm />
        </div>
      </section>
    </div>
  </PathwayLayout>;
}

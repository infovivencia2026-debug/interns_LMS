import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Asterisk, Award, Briefcase, CalendarRange, Check, ClipboardCheck, FolderKanban, Globe, Lightbulb, ListChecks, Mail, MessageCircle, MessagesSquare, Minus, Plus, Rocket, TrendingUp, Zap } from "lucide-react";
import { PathwayLayout, Photo } from "./PathwayLayout";
import "./college-partnership.css";

/* College Partnership (preview): corporate layout in white, royal blue and
   deep navy, with marquee strips framing the dark sections. */

const WHATSAPP = "918121306701";

const pillars = [
  { name: "Emerging Tech Skills", icon: Zap, text: "Live mentor-led and online learning formats" },
  { name: "Industry Projects", icon: FolderKanban, text: "Structured exercises and project support" },
  { name: "Internships & Mentorship", icon: Briefcase, text: "Supervised internships and career preparation" },
  { name: "Career Readiness", icon: TrendingUp, text: "Programme-specific evaluations and certificates" },
];

const offerings = [
  { icon: Award, title: "Skill Programmes & Certifications", text: "AI, cybersecurity, SOC operations, data science and emerging technologies, with structured learning and practical assessments." },
  { icon: Zap, title: "Workshops & Bootcamps", text: "One-day and multi-day hands-on sessions, guided labs and application-building experiences." },
  { icon: Lightbulb, title: "Hackathons & Innovation", text: "Campus problem-solving challenges and collaborative events that encourage students to build and present solutions." },
  { icon: FolderKanban, title: "Academic Project Support", text: "Guidance for mini-projects, final-year projects, development milestones, testing and project demonstrations." },
  { icon: Briefcase, title: "Internship Opportunities", text: "Role-based, mentor-supported programmes featuring hands-on tasks, workplace simulations and project portfolios." },
  { icon: TrendingUp, title: "Career & Portfolio Readiness", text: "Resume building, proof-of-work documentation, LinkedIn presence, interview preparation and skills presentation." },
];

const statements = ["Learn the technology.", "Apply the knowledge.", "Show the work."];

const models = [
  { title: "Academic Integration", photo: "s-pt-gains", text: "Semester-aligned add-on modules in AI, cybersecurity, SOC and data science.", tags: ["AI", "Cybersecurity", "SOC", "Data Science"] },
  { title: "Online Programmes", photo: "intl-aica", text: "Flexible learning journeys supported by ONROL’s online platform and mentors.", tags: ["Online", "Mentors"] },
  { title: "Internships & Projects", photo: "s-pt-projects", text: "Task-based projects, mentor reviews and documented student proof of work.", tags: ["Projects", "Mentor reviews"] },
  { title: "Campus Bootcamps", photo: "s-cp-formats", text: "Focused workshops, practical labs and intensive hands-on training.", tags: ["Workshops", "Labs"] },
  { title: "Hackathons", photo: "intl-generalist", text: "Challenge-driven innovation programmes and project showcases.", tags: ["Challenges", "Showcases"] },
];

const steps = [
  { icon: MessagesSquare, title: "Discuss", text: "Understand your institution’s student profile and priorities." },
  { icon: ListChecks, title: "Select", text: "Choose programmes, tracks and formats that fit your needs." },
  { icon: CalendarRange, title: "Plan", text: "Align schedules, departments, learning outcomes and logistics." },
  { icon: Rocket, title: "Deliver", text: "Run mentor-supported learning, workshops and practical activities." },
  { icon: ClipboardCheck, title: "Review", text: "Document participation, submissions and progress." },
];

// Questions answered only with what the partnership content above already states.
const faqs = [
  { q: "What can ONROL bring to our campus?", a: "Skill programmes and certifications, workshops and bootcamps, hackathons, academic project support, internship opportunities and career and portfolio readiness." },
  { q: "Which technology areas do the programmes cover?", a: "Artificial intelligence, cybersecurity, SOC analyst skills, data science, AI automation and applied projects." },
  { q: "How can the programmes be delivered?", a: "Through academic integration, online programmes, internships and projects, campus bootcamps or hackathons. You can partner on a single programme or combine several across departments and student groups." },
  { q: "What does the partnership process look like?", a: "Five steps: discuss your student profile and priorities, select programmes and formats, plan schedules and logistics, deliver mentor-supported learning, then review participation, submissions and progress." },
  { q: "Do students receive evaluations and certificates?", a: "Yes. Programmes include programme-specific evaluations and certificates, alongside structured exercises, project support and supervised internships." },
];

const interests = ["Academic integration", "Workshops and bootcamps", "Hackathons", "Academic projects", "Internship programmes", "Career readiness", "Multiple programmes"];
const ticker = ["Artificial Intelligence", "Cybersecurity", "SOC Analyst", "Data Science", "AI Automation", "Hackathons", "Internships", "Career Readiness"];

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="cpx-eyebrow"><i>//</i>{children}</span>;
}

function Marquee() {
  return <div className="cpx-marquee" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{ticker.map(t => <em key={t}><Asterisk size={26} strokeWidth={2.4} />{t}</em>)}</span>)}</div></div>;
}

function RegisterForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const v = new FormData(event.currentTarget);
    const message = ["Hello ONROL, I’d like to register our institution’s partnership interest.", `Institution: ${v.get("institution")}`, `Contact: ${v.get("contact")}`, `Email: ${v.get("email")}`, `Phone / WhatsApp: ${v.get("phone")}`, `City / State: ${v.get("city") || "—"}`, `Interest: ${v.get("interest")}`].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSent(true);
  }
  return <form className="cpx-form" onSubmit={submit}>
    <div className="cpx-fields">
      <label className="is-full">College / Institution Name *<input name="institution" required maxLength={180} placeholder="Your college or institution" /></label>
      <label>Contact Person & Designation *<input name="contact" required maxLength={140} autoComplete="name" placeholder="e.g. Dr. A. Rao, Principal" /></label>
      <label>Official Email Address *<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@college.edu.in" /></label>
      <label>Phone / WhatsApp *<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91" /></label>
      <label>City / State<input name="city" maxLength={120} placeholder="e.g. Hyderabad, Telangana" /></label>
      <label className="is-full">Programme of Interest *<select name="interest" required defaultValue=""><option value="" disabled>Choose programme of interest</option>{interests.map(i => <option key={i}>{i}</option>)}</select></label>
    </div>
    <button className="cpx-btn" type="submit">Register Interest <ArrowRight size={16} /></button>
    {sent
      ? <p className="cpx-form-ok" role="status"><Check size={16} /> WhatsApp has opened with your enquiry, ready to review and send.</p>
      : <p className="cpx-form-note">Opens WhatsApp with your enquiry ready to review and send. <Link to="/privacy-policy">Privacy policy</Link></p>}
  </form>;
}

export default function CollegePartnership() {
  const [faq, setFaq] = useState(1);

  return <PathwayLayout seo={{ title: "College Partnership | ONROL AI Execution School", description: "Partner with ONROL to bring practical AI and cybersecurity skills, hands-on projects, internship programmes and career readiness support to your college.", path: "/college-partnership" }}>
    <div className="cpx">
      {/* hero */}
      <section className="cpx-hero">
        <Photo className="cpx-hero-bg" src="/pathways/s-pt-hero.webp" sizes="100vw" eager position="70% 40%" />
        <div className="cpx-wrap cpx-hero-copy">
          <Eyebrow>ONROL × Higher Education</Eyebrow>
          <h1>Empowering Colleges. Building Industry‑Ready Talent.</h1>
          <p>Bridge the gap between academic learning and industry expectations through practical AI and cybersecurity skills, hands-on projects, internship programmes and career readiness support.</p>
          <div className="cpx-actions">
            <a className="cpx-btn" href="#register">Explore a Partnership <ArrowRight size={16} /></a>
            <a className="cpx-textlink" href="#programmes">Discover Our Programmes</a>
          </div>
        </div>
      </section>
      <Marquee />

      {/* about */}
      <section className="cpx-section">
        <div className="cpx-wrap cpx-about">
          <div className="cpx-collage sx-r">
            <span className="cpx-frame is-a" aria-hidden="true" /><span className="cpx-frame is-b" aria-hidden="true" />
            <Photo className="is-1" src="/pathways/s-cp-hero.webp" alt="A mentor guiding students working on laptops" sizes="(max-width: 900px) 60vw, 26vw" />
            <Photo className="is-2" src="/pathways/s-pt-career.webp" alt="A mentor coaching a student" sizes="(max-width: 900px) 40vw, 16vw" />
            <Photo className="is-3" src="/pathways/s-pt-skills.webp" alt="Two students studying together" sizes="(max-width: 900px) 40vw, 16vw" />
            <Photo className="is-4" src="/pathways/s-pt-internships.webp" alt="Interns working with a mentor" sizes="(max-width: 900px) 60vw, 26vw" />
            <span className="cpx-badge" aria-hidden="true">
              <svg viewBox="0 0 100 100"><defs><path id="cpx-ring" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" /></defs><text><textPath href="#cpx-ring">COLLEGE PARTNERSHIP • ONROL • </textPath></text></svg>
              <b><ArrowUpRight size={18} /></b>
            </span>
            <span className="cpx-spark is-1" aria-hidden="true">✦</span><span className="cpx-spark is-2" aria-hidden="true">✦</span><span className="cpx-spark is-3" aria-hidden="true">✦</span>
          </div>
          <div className="sx-r">
            <Eyebrow>Skills that go beyond classrooms</Eyebrow>
            <h2>{statements[0]} <span>{statements[1]}</span> {statements[2]}</h2>
            <p>Our programmes combine guided instruction with applied tasks and portfolio-building opportunities, making practical evidence of learning central to the experience.</p>
            <a className="cpx-btn" href="#register">Explore a Partnership <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      {/* services */}
      <section className="cpx-section is-grey" id="programmes">
        <div className="cpx-wrap">
          <div className="cpx-head is-row sx-r">
            <div><Eyebrow>What we bring to your campus</Eyebrow><h2>One partnership. <span>Multiple pathways to student growth.</span></h2></div>
            <a className="cpx-btn is-sm" href="#register">Register Interest</a>
          </div>
          <div className="cpx-services">{offerings.map(({ icon: Icon, title, text }) => <article key={title} className="cpx-service sx-r">
            <span className="cpx-icon"><Icon size={24} /></span>
            <h3>{title}</h3><p>{text}</p>
            <a href="#register">Plan this <ArrowRight size={14} /></a>
          </article>)}</div>
        </div>
      </section>

      {/* process */}
      <section className="cpx-section">
        <div className="cpx-wrap">
          <div className="cpx-head is-center sx-r"><Eyebrow>Simple partnership process</Eyebrow><h2>From the first conversation to <span>real learning outcomes.</span></h2></div>
          <ol className="cpx-process sx-r">{steps.map(({ icon: Icon, title, text }, i) => <li key={title}>
            <span className="cpx-step-icon"><Icon size={26} /><b>0{i + 1}</b></span>
            <h3>{title}</h3><p>{text}</p>
          </li>)}</ol>
        </div>
      </section>

      {/* why */}
      <section className="cpx-dark">
        <span className="cpx-ghost" aria-hidden="true">WHY ONROL</span>
        <div className="cpx-wrap">
          <div className="cpx-head is-row sx-r">
            <div><Eyebrow>Partner · Ship</Eyebrow><h2>Four pillars of one partnership</h2></div>
            <a className="cpx-btn is-sm" href="#register">Explore a Partnership</a>
          </div>
          <div className="cpx-why">
            <figure className="sx-r"><Photo src="/pathways/s-pt-workshops.webp" alt="A team collaborating around a table in a hands-on workshop" sizes="(max-width: 900px) 100vw, 46vw" /></figure>
            <div className="cpx-features">{pillars.map(({ icon: Icon, name, text }) => <div key={name} className="sx-r"><Icon size={40} strokeWidth={1.4} /><h3>{name}</h3><p>{text}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* delivery models showcase */}
      <section className="cpx-section" id="delivery">
        <div className="cpx-wrap">
          <div className="cpx-head is-center sx-r"><Eyebrow>Flexible collaboration</Eyebrow><h2>Choose a delivery model that works for <span>your institution.</span></h2><p>Partner on a single programme or combine multiple initiatives across departments and student groups.</p></div>
          <div className="cpx-works">{models.map(({ title, photo, text, tags }, i) => <a key={title} href="#register" className={`cpx-work sx-r${i < 2 ? " is-big" : ""}`}>
            <Photo src={`/pathways/${photo}.webp`} sizes={i < 2 ? "(max-width: 700px) 100vw, 45vw" : "(max-width: 700px) 100vw, 30vw"} />
            <div><small>Model 0{i + 1}</small><h3>{title}</h3><p>{text}</p><span className="cpx-tags">{tags.map(t => <em key={t}>{t}</em>)}</span></div>
            <b className="cpx-go"><ArrowUpRight size={20} /></b>
          </a>)}</div>
          <div className="cpx-center sx-r"><a className="cpx-btn is-sm" href="#register">Discuss a Delivery Model</a></div>
        </div>
      </section>

      {/* register */}
      <section className="cpx-section is-grey" id="register">
        <div className="cpx-wrap cpx-contact">
          <aside className="cpx-info sx-r">
            <div><h3>Website</h3><a href="https://onrol.in">www.onrol.in</a></div>
            <div><h3>Email</h3><a href="mailto:info@onrol.in">info@onrol.in</a></div>
            <div><h3>WhatsApp</h3><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">+91 81213 06701</a></div>
            <div><h3>Stay Connected</h3><span className="cpx-social"><a href="https://onrol.in" aria-label="Website"><Globe size={16} /></a><a href="mailto:info@onrol.in" aria-label="Email"><Mail size={16} /></a><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} /></a></span></div>
          </aside>
          <div className="sx-r">
            <Eyebrow>Partner with ONROL</Eyebrow>
            <h2>Register Partnership <span>Interest</span> Today!</h2>
            <p className="cpx-form-lede">Share your institution’s details to prepare a partnership enquiry.</p>
            <RegisterForm />
          </div>
        </div>
      </section>

      {/* image band */}
      <section className="cpx-band">
        <Photo className="cpx-band-bg" src="/pathways/enquire-college.webp" sizes="100vw" />
      </section>

      {/* faqs */}
      <section className="cpx-section is-grey">
        <div className="cpx-wrap">
          <div className="cpx-head sx-r"><Eyebrow>FAQs</Eyebrow><h2>Question? <span>Look here.</span></h2></div>
          <div className="cpx-faq">
            <div className="cpx-faq-list sx-r">{faqs.map(({ q, a }, i) => <div key={q} className={`cpx-q${faq === i ? " is-open" : ""}`}>
              <button type="button" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>{q}{faq === i ? <Minus size={18} /> : <Plus size={18} />}</button>
              {faq === i && <p>{a}</p>}
            </div>)}</div>
            <div className="cpx-faq-side sx-r">
              <div className="cpx-help"><MessageCircle size={40} /><h3>You have different questions?</h3><p>Our team will answer all your questions about a campus partnership.</p><a className="cpx-btn is-sm" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Contact Us</a></div>
              <a className="cpx-mailcard" href="mailto:info@onrol.in"><Mail size={22} /><span><small>Write to us</small><b>info@onrol.in</b></span></a>
            </div>
          </div>
        </div>
      </section>

      {/* connect */}
      <section className="cpx-connect">
        <div className="cpx-wrap">
          <h2>Let’s build a <span>future-ready campus</span> together</h2>
          <a className="cpx-btn is-sm" href="#register">Register Interest</a>
        </div>
      </section>
    </div>
  </PathwayLayout>;
}

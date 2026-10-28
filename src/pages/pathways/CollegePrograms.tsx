import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Braces, ShieldCheck, Lightbulb } from "lucide-react";
import { Enquiry, FAQ, PathwayLayout, Photo } from "./PathwayLayout";
import { SxCard, SxChecks, SxEnquire, SxHeading, SxHero, SxPage, SxSection, SxSteps } from "./SimpleKit";

const tracks = [
  { name: "Applied AI", icon: Braces, heading: "Turn curiosity into something that works.", text: "Move from AI literacy to useful applications. Students explore prompting, workflow automation and building small products around real problems.", skills: ["Prompt design & responsible AI", "No-code apps & automation", "Research & knowledge assistants"], project: "A campus helpdesk assistant with a documented workflow and a live demo.", link: "/programs/ai", linkText: "Explore the AI curriculum" },
  { name: "Cybersecurity", icon: ShieldCheck, heading: "Learn to think like a defender.", text: "Connect networks, systems and security concepts through guided exercises. Keep every security activity inside an authorised practice environment.", skills: ["Networking & system foundations", "Threat analysis & security hygiene", "Detection, response & reporting"], project: "A security lab investigation, with evidence, findings and a remediation report.", link: "/programs/cyber", linkText: "Explore the cyber curriculum" },
  { name: "Build & innovate", icon: Lightbulb, heading: "Give a good idea its first working version.", text: "Bring students from different departments together to identify a problem, shape a solution and present a prototype they can explain.", skills: ["Problem discovery & scoping", "Rapid prototyping & iteration", "Demo storytelling & documentation"], project: "A working prototype for a campus or community problem, presented with a project brief.", link: "/programs/aica", linkText: "Explore the starting pathway" },
];

const formats = [
  { title: "Campus workshop", tag: "Spark an interest", text: "An accessible introduction that helps students try the tools, ask better questions and complete a guided exercise.", for: "Student clubs, department events & first-time learners" },
  { title: "Student cohort", tag: "Build momentum", text: "A structured learning journey with connected sessions, practice and a scoped project to bring it all together.", for: "Departments, placement cells & focused student groups" },
  { title: "Project lab", tag: "Put it to work", text: "A focused build sprint around a real problem. Take an idea through planning, prototyping, review and a final demonstration.", for: "Innovation cells, project teams & campus communities" },
];

const steps: [string, string][] = [["Discover", "Share your student profile, learning goals and campus constraints."], ["Design", "Agree the pathway, format, scope, schedule and responsibilities."], ["Build", "Give students room to practise, ask questions and work on a concrete brief."], ["Demonstrate", "Review the work through a demo, documentation and constructive feedback."]];

const faqs = [
  { question: "Who can enquire about a college program?", answer: "College management, department leads, placement teams, faculty coordinators and student communities can start a conversation. Share your institution and the group you have in mind." },
  { question: "Do students need coding experience?", answer: "It depends on the pathway. Introductory AI activities can be scoped for beginners. Advanced AI and cybersecurity labs need a discussion of prior knowledge and technical setup." },
  { question: "Can a program fit our academic calendar?", answer: "Share your preferred dates, group size and learning goals. The team will discuss a suitable schedule and delivery format before confirming availability." },
  { question: "Will students receive academic credits or guaranteed placements?", answer: "This page does not offer university credits, recognised qualifications or placement guarantees. Any assessment, completion document or institutional arrangement must be confirmed in a written program proposal." },
  { question: "Can an individual student join an existing ONROL program?", answer: "Yes, students can explore the existing program pages and contact ONROL about eligibility, fees and current cohort availability. Campus partnerships are discussed separately." },
];

export default function CollegePrograms() {
  return <PathwayLayout><SxPage>
    <SxHero kicker="ONROL for colleges" title={<>Big ideas. Real skills. <em>On your campus.</em></>} image="/pathways/s-cp-hero.webp" alt="Students working on laptops with a mentor in a bright classroom" actions={<><a className="sx-btn" href="#enquire">Build a campus program <ArrowUpRight size={18} /></a><a className="sx-btn-outline" href="#pathways">Explore pathways <ArrowDown size={16} /></a></>} facts={[["Format", "Workshop · Cohort · Lab"], ["Tracks", "AI & Cybersecurity"], ["Learning", "Project-led"], ["Outcome", "Work students can show"]]}>Bring the execution mindset to your college. Practical AI, cybersecurity and project experiences that connect classroom learning to work students can show.</SxHero>
    <SxSection id="pathways" soft><SxHeading kicker="The learning pathways" title={<>A place for every <em>kind of builder.</em></>}>Start with your students’ interests and existing skills. Shape the depth and project scope with the ONROL team.</SxHeading><div className="sx-grid is-3">{tracks.map(track => <SxCard key={track.name} icon={track.icon} label={track.name} title={track.heading}><p>{track.text}</p><SxChecks items={track.skills} /><div className="sx-example"><b>Example project</b>{track.project}</div><Link className="sx-link" to={track.link}>{track.linkText} <ArrowUpRight size={16} /></Link></SxCard>)}</div></SxSection>
    <SxSection id="formats"><div className="sx-split"><figure className="sx-split-photo sx-r"><Photo src="/pathways/s-cp-formats.webp" alt="Students working together in small groups in a bright classroom" sizes="(max-width: 900px) 100vw, 48vw" /></figure><div><SxHeading kicker="Make it fit your campus" title={<>One ambition. <em>A few ways to start.</em></>}>Formats to discuss, designed around your academic calendar, learner level and resources.</SxHeading><div className="sx-rows">{formats.map((format, i) => <article className="sx-r" key={format.title}><span>0{i + 1}</span><h3>{format.title}</h3><p>{format.text}</p><small>Good for: <b>{format.for}</b></small></article>)}</div><p className="sx-note">Delivery mode, duration, fees, mentor availability and assessment are agreed with your institution before confirmation.</p></div></div></SxSection>
    <SxSection soft><SxHeading kicker="From first chat to final demo" title={<>A clear plan. <em>Shared ownership.</em></>} /><SxSteps steps={steps} /></SxSection>
    <SxSection><div className="sx-faq"><SxHeading kicker="Before we begin" title={<>Good questions. <em>Clear answers.</em></>}>Can’t find what you need? <a className="sx-link" href="#enquire">Ask us directly</a></SxHeading><FAQ items={faqs} /></div></SxSection>
    <Enquiry Frame={SxEnquire} />
  </SxPage></PathwayLayout>;
}

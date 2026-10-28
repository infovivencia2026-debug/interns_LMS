import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Award, Bot, Briefcase, Code2, Rocket, ShieldCheck, Sparkles, Target } from "lucide-react";
import { ApplyButton, CountUp, Cta, Eyebrow, Faq, Lines, PageHero, SiteLayout } from "../Site";
import { CARDS } from "../ProgramCards";
import { programBySlug, type ProgramDetail as Program } from "../data/programs";
import NotFound from "@/pages/NotFound";

const OUTCOME_ICONS = [Award, Rocket, Code2, Bot, Target, Briefcase, Sparkles, ShieldCheck];

/** "Heading — description" strings from the data become a title and a line. */
function splitOutcome(text: string) {
  const [title, ...rest] = text.split(" — ");
  return { title, text: rest.join(" — ") };
}

/** "Day 3 · Topic — detail" style items keep their lead-in bold. */
function Topic({ text }: { text: string }) {
  const [head, ...rest] = text.split(" — ");
  return rest.length ? <li><b>{head}</b> — {rest.join(" — ")}</li> : <li>{text}</li>;
}

/** Facts like "7+" or "50+" count up; anything that isn't a number stays as text. */
function FactValue({ value }: { value: string }) {
  const match = /^(\d+)(\+?)$/.exec(value.trim());
  return match ? <CountUp to={Number(match[1])} suffix={match[2]} /> : <span>{value}</span>;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-30% 0px -60% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function Body({ program }: { program: Program }) {
  const sections = [
    ["outcomes", "What you walk away with", program.outcomes.length > 0],
    ["curriculum", "Curriculum", program.modules.length > 0],
    ["projects", "What you build", program.projects.length > 0],
    ["tools", "Tools", program.tools.length > 0],
    ["audience", "Who it’s for", program.audience.length > 0],
    ["faq", "Questions", program.faqs.length > 0],
  ].filter(([, , show]) => show) as [string, string, boolean][];
  const ids = sections.map(([id]) => id);
  const active = useActiveSection(ids);

  return <div className="ox-program-layout">
    <nav className="ox-toc" aria-label="On this page">
      <span>On this page</span>
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? "is-on" : ""}>{label}</a>)}
      <ApplyButton course={program.course}>Apply</ApplyButton>
    </nav>
    <div>
      {program.outcomes.length > 0 && <section id="outcomes" className="ox-block">
        <div data-reveal><Eyebrow>What you walk away with</Eyebrow><h2>Proof of work, <em>not a certificate.</em></h2></div>
        <div className="ox-grid c2">{program.outcomes.map((item, i) => { const o = splitOutcome(item); const Icon = OUTCOME_ICONS[i % OUTCOME_ICONS.length]; return <article key={item} className="ox-card ox-spot" data-reveal><span className="ox-icon"><Icon size={22} /></span><h3>{o.title}</h3>{o.text && <p>{o.text}</p>}</article>; })}</div>
      </section>}

      {program.modules.length > 0 && <section id="curriculum" className="ox-block">
        <div data-reveal><Eyebrow>The curriculum</Eyebrow><h2>Built one shipped <em>step at a time.</em></h2></div>
        <div className="ox-curriculum">{program.modules.map((mod, i) => <details key={mod.title} className="ox-module" open={i === 0} data-reveal>
          <summary><span className="ox-module-n">{String(i + 1).padStart(2, "0")}</span><span><b>{mod.title}</b>{(mod.meta || mod.topics.length > 0) && <small>{mod.meta ?? `${mod.topics.length} topics`}</small>}</span><i aria-hidden="true" /></summary>
          <div className="ox-details-body"><div><div className="ox-module-body">{mod.summary && <p>{mod.summary}</p>}<ul>{mod.topics.map(t => <Topic key={t} text={t} />)}</ul></div></div></div>
        </details>)}</div>
      </section>}

      {program.projects.length > 0 && <section id="projects" className="ox-block">
        <div data-reveal><Eyebrow>What you build</Eyebrow><h2>Real builds, <em>live links.</em></h2></div>
        <div className="ox-grid c2">{program.projects.map((p, i) => <article key={p.title} className="ox-card ox-spot" data-reveal><span className="ox-num">BUILD {String(i + 1).padStart(2, "0")}</span><h3>{p.title}</h3><p>{p.text}</p></article>)}</div>
      </section>}

      {program.tools.length > 0 && <section id="tools" className="ox-block">
        <div data-reveal><Eyebrow>Tools</Eyebrow><h2>The stack you’ll <em>actually use.</em></h2></div>
        <div className="ox-pills" data-reveal>{program.tools.map(t => <span key={t} className="ox-pill">{t}</span>)}</div>
      </section>}

      {program.audience.length > 0 && <section id="audience" className="ox-block">
        <div data-reveal><Eyebrow>Who it’s for</Eyebrow><h2>Made for <em>where you are now.</em></h2></div>
        {program.audience.every(a => a.length < 40)
          ? <div className="ox-pills" data-reveal>{program.audience.map(a => <span key={a} className="ox-pill">{a}</span>)}</div>
          : <ul className="ox-ticks" data-reveal>{program.audience.map(a => <li key={a}>{a}</li>)}</ul>}
      </section>}

      {program.faqs.length > 0 && <section id="faq" className="ox-block">
        <div data-reveal><Eyebrow>Questions</Eyebrow><h2>Before you <em>apply.</em></h2></div>
        <Faq items={program.faqs} name={`faq-${program.slug}`} />
      </section>}

      {program.note && <p className="ox-muted" style={{ marginTop: 40, fontSize: 14.5 }} data-reveal>{program.note}</p>}
    </div>
  </div>;
}

export default function ProgramDetail({ slug }: { slug: string }) {
  const program = programBySlug(slug);
  if (!program) return <NotFound />;
  const words = program.name.split(" ");
  const others = CARDS.filter(c => c.slug !== program.slug);

  return <SiteLayout seo={{ title: program.seoTitle, description: program.seoDescription, path: program.path }} course={program.course}>
    <PageHero
      eyebrow={`${program.track === "AI" ? "AI track" : "Cyber security track"} · ${program.kicker}`}
      crumbs={[["/", "Home"], ["/programs", "Programs"], [program.path, program.name]]}
      title={<Lines>{words.length > 1 && <>{words.slice(0, -1).join(" ")}</>}<em>{words[words.length - 1]}</em></Lines>}
      lede={program.lede}
      side={<div className="ox-actions"><ApplyButton course={program.course}>Apply for this program</ApplyButton><a className="ox-btn is-ghost" href={program.modules.length ? "#curriculum" : "#outcomes"}>See the curriculum</a></div>}
    />

    <section className="is-dark" style={{ paddingBottom: "clamp(56px,7vw,96px)" }}>
      <div className="ox-wrap">
        <div className="ox-stats" data-reveal>{program.facts.map(([label, value]) => <div key={label}><strong><FactValue value={value} /></strong><span>{label}</span></div>)}</div>
      </div>
    </section>

    <section className="ox-sec is-cream"><div className="ox-wrap"><Body program={program} /></div></section>

    <section className="ox-sec is-tight">
      <div className="ox-wrap">
        <div className="ox-head is-split" data-reveal><div><Eyebrow>Keep exploring</Eyebrow><h2>The other <em>programs.</em></h2></div><Link className="ox-link" to="/programs">Compare all five <ArrowRight size={16} /></Link></div>
        <div className="ox-grid c4">{others.map((c, i) => <Link key={c.slug} to={`/programs/${c.slug}`} className="ox-card ox-spot" data-reveal style={{ "--rd": `${i * 80}ms` } as CSSProperties}>
          <span className="ox-num">{c.track === "AI" ? "AI TRACK" : "CYBER TRACK"} · {c.length.toUpperCase()}</span>
          <h3>{c.name}</h3><p>{c.text}</p>
          <span className="ox-link" style={{ marginTop: 16 }}>View program <ArrowUpRight size={16} /></span>
        </Link>)}</div>
      </div>
    </section>

    <Cta title={<>Ready to build? <em>Start here.</em></>} actions={<><ApplyButton course={program.course}>Apply now</ApplyButton><Link className="ox-btn is-ghost" to="/masterclass">Free masterclass</Link></>}>Apply in twenty seconds. Our team calls you back about the fit, the next cohort date and the fee. No payment at the application step.</Cta>
  </SiteLayout>;
}

import { useEffect, useRef, useState, FormEvent } from "react";
import {
  ArrowRight, Award, CalendarClock, Check, CheckCircle2, ChevronDown, GraduationCap,
  IndianRupee, MapPin, School, ShieldCheck, Clock, UploadCloud, FileCheck2,
} from "lucide-react";
import Footer from "@/components/shared/Footer";
import SEO from "@/components/seo/SEO";
import { breadcrumbJsonLd, organizationJsonLd } from "@/lib/structuredData";
import { PhoneInput } from "@/components/shared/PhoneInput";

/**
 * onrol.in/applyforintern — public intern application (professional onboarding).
 *
 * Split-panel: dark step-tracker rail + clean white form. Posts to the CRM's
 * ISOLATED intern intake (https://go.onrol.in/api/public/intern-application) →
 * de-duplicated contact in the "Intern Applications" pipeline + rich record,
 * surfaced in the CRM "Intern Leads" window. Rate-limited + honeypot server-side.
 *
 * Per-college link: ?college=<name> pre-fills + locks the college and tags the
 * submission (campaign="College: <name>") for per-college tracking.
 */

const CRM_INTERN_URL = "https://go.onrol.in/api/public/intern-application";

const ROLES = [
  "Sales & Marketing", "HR", "Admission Counsellors", "AI Developers",
  "Social Media Managers", "Graphic Designers", "Video Editors", "Other",
];
const YEARS = ["1st year", "2nd year", "3rd year", "Final year", "Graduate", "Post-graduate"];
const START = ["Immediately", "Within 2 weeks", "Within 1 month", "In 2–3 months"];
const COMMIT = ["Full-time", "Part-time", "Flexible / project-based"];

const PERKS = [
  { Icon: Award, label: "Verified internship certificate" },
  { Icon: GraduationCap, label: "Complimentary ONROL course access" },
  { Icon: IndianRupee, label: "Performance incentives on sales" },
  { Icon: MapPin, label: "On-site or hybrid" },
  { Icon: CalendarClock, label: "3 to 6 month duration" },
];

// Wizard steps (the left-rail tracker + the form panels map 1:1 to these).
const STEPS = [
  { id: "about", label: "About you" },
  { id: "edu", label: "Education" },
  { id: "skills", label: "Skills & work" },
  { id: "more", label: "Finish & submit" },
];

function readContext(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const ref = p.get("ref"); if (ref) out.ref = ref;
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = p.get(k); if (v) out[k] = v;
  }
  return out;
}

export default function ApplyForIntern() {
  const path = "/applyforintern";
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honey, setHoney] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [lockedCollege, setLockedCollege] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeStatus, setResumeStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [resumeErr, setResumeErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedAt = useRef(0);
  const LAST = STEPS.length - 1;

  async function onResumeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeErr(null);
    if (file.size > 8 * 1024 * 1024) { setResumeErr("Résumé too large (max 8 MB)."); return; }
    setResumeName(file.name); setResumeStatus("uploading"); setResumeUrl("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("https://go.onrol.in/api/public/intern-resume", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({} as { url?: string; message?: string }));
      if (!r.ok || !d.url) throw new Error(d.message ?? "Upload failed");
      setResumeUrl(d.url); setResumeStatus("done");
    } catch (err) {
      setResumeStatus("error");
      setResumeErr(err instanceof Error ? err.message : "Upload failed — you can paste a link instead.");
    }
  }
  function clearResume() { setResumeUrl(""); setResumeName(""); setResumeStatus("idle"); setResumeErr(null); }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setLockedCollege((p.get("college") || "").trim().slice(0, 80));
  }, []);

  // Validate only the fields on step 0 before advancing (rest are optional
  // until final submit). Returns true if the step is OK to leave.
  function validateStep0(): boolean {
    const d = new FormData(formRef.current!);
    const name = String(d.get("name") ?? "").trim();
    const phone = String(d.get("phone") ?? "").replace(/[^\d+]/g, "");
    const email = String(d.get("email") ?? "").trim().toLowerCase();
    if (!name) { setError("Please enter your full name."); return false; }
    if (!phone || phone.replace(/^\+/, "").length < 8) { setError("Please enter a valid WhatsApp number."); return false; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { setError("That email doesn't look right."); return false; }
    return true;
  }
  function goNext() {
    setError(null);
    if (step === 0 && !validateStep0()) return;
    const n = Math.min(step + 1, LAST);
    setStep(n); setMaxReached((m) => Math.max(m, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goBack() { setError(null); setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goTo(i: number) { if (i <= maxReached) { setError(null); setStep(i); window.scrollTo({ top: 0, behavior: "smooth" }); } }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (step < LAST) { goNext(); return; } // Enter on a non-final step → advance, don't submit
    const now = Date.now();
    if (now - submittedAt.current < 2000) return;
    submittedAt.current = now;
    setError(null);
    if (honey) { setOk(true); return; }

    const form = e.currentTarget;
    const d = new FormData(form);
    const g = (k: string) => String(d.get(k) ?? "").trim();

    const name = g("name");
    const phone = g("phone").replace(/[^\d+]/g, "");
    const email = g("email").toLowerCase();
    const consent = d.get("consent") != null;

    if (!name) { setError("Please enter your full name."); return; }
    if (!phone || phone.replace(/^\+/, "").length < 8) { setError("Please enter a valid WhatsApp number."); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { setError("That email doesn't look right."); return; }
    if (!consent) { setError("Please agree to be contacted about your application."); return; }

    if (resumeStatus === "uploading") { setError("Please wait for your résumé to finish uploading."); return; }

    // Résumé: prefer the uploaded file; else validate + normalise the pasted link.
    let resume = resumeUrl;
    if (!resume) {
      const link = g("resume");
      if (link) {
        const norm = /^https?:\/\//i.test(link) ? link
          : (!/\s/.test(link) && /^([a-z0-9-]+\.)+[a-z]{2,}(\/|\?|$)/i.test(link) ? "https://" + link : "");
        if (!norm) { setError("That résumé link doesn't look valid — upload the file, or paste a full link (https://…)."); return; }
        resume = norm;
      }
    }

    const availability = [g("start"), g("commit")].filter(Boolean).join(" · ");
    setBusy(true);
    try {
      const body = {
        name, phone, email,
        roleInterested: g("role"), collegeName: lockedCollege || g("college"), branch: g("branch"),
        yearOfStudy: g("year"), city: g("city"), skills: g("skills"),
        portfolioUrl: g("portfolio"), linkedinUrl: g("linkedin"), githubUrl: g("github"),
        resumeUrl: resume, availability, whyIntern: g("why"), commPref: g("commPref"),
        consent,
        ...(lockedCollege ? { campaign: `College: ${lockedCollege}` } : {}),
        ...readContext(),
      };
      const r = await fetch(CRM_INTERN_URL, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({} as { message?: string }));
        throw new Error(data.message ?? `Submission failed (${r.status})`);
      }
      setOk(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SEO
        title="Apply for an Internship at ONROL — India's AI Execution School"
        description="Join ONROL as an intern across AI, sales, design, HR and content. Real projects, a verified certificate, sales incentives and on-site/hybrid work. Apply in minutes."
        path={path}
        jsonLd={[
          breadcrumbJsonLd([{ name: "Home", href: "/" }, { name: "Apply for Internship", href: path }]),
          organizationJsonLd(),
        ]}
      />

      <main className="min-h-screen bg-white text-slate-900">
        {ok ? (
          <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
              <CheckCircle2 className="h-9 w-9 text-blue-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Application received</h1>
            <p className="mt-3 leading-relaxed text-slate-500">
              Thanks for applying to ONROL. Our team reviews every application — if there's a fit, we'll reach out
              on WhatsApp or email, usually within 48 hours.
            </p>
            <a href="https://interns.onrol.in/" className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
              ONROL Internships home <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
            {/* ── LEFT — dark step-tracker rail ─────────────────────────── */}
            <aside className="relative border-r border-slate-800/60 bg-slate-950 px-6 pb-12 pt-24 text-white sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:pb-10 lg:pt-24">
              <a
                href="https://interns.onrol.in/"
                className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:left-10"
              >
                <ArrowRight className="h-4 w-4 rotate-180" aria-hidden /> ONROL Internships
              </a>
              <div className="flex h-full max-w-md flex-col lg:mx-auto">
                <span className="inline-flex w-fit items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  <span className="h-px w-6 bg-blue-400/60" aria-hidden /> Internship Program
                </span>
                <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Start your ONROL internship
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                  Real projects at India's AI Execution School — across AI, sales, design, content and operations.
                  Mentor-led and built to make you hireable.
                </p>

                {/* step tracker (click a reached step to jump back) */}
                <ol className="mt-9">
                  {STEPS.map((s, i) => {
                    const complete = i < step;
                    const active = i === step;
                    const reachable = i <= maxReached;
                    return (
                      <li key={s.id} className="relative">
                        {i < STEPS.length - 1 ? (
                          <span aria-hidden className={`absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px ${complete ? "bg-blue-600" : "bg-slate-800"}`} />
                        ) : null}
                        <button
                          type="button" onClick={() => goTo(i)} disabled={!reachable}
                          aria-current={active ? "step" : undefined}
                          className={`flex w-full items-center gap-3.5 rounded-md py-2.5 pr-2 text-left transition ${reachable ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
                        >
                          <span className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition
                            ${complete ? "bg-blue-600 text-white" : active ? "bg-slate-950 text-white ring-2 ring-blue-500" : "bg-slate-900 text-slate-500 ring-1 ring-slate-700"}`}>
                            {complete ? <Check className="h-4 w-4" /> : i + 1}
                          </span>
                          <span className={`text-sm font-medium transition ${complete || active ? "text-white" : "text-slate-500"}`}>{s.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {/* benefits */}
                <div className="mt-9 border-t border-white/10 pt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">What you get</p>
                  <ul className="mt-4 space-y-2.5">
                    {PERKS.map(({ Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-sm text-slate-300">
                        <Icon className="h-4 w-4 shrink-0 text-blue-400" aria-hidden /> {label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-9 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~3 minutes</span>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Reviewed within 48 hours</span>
                </div>
              </div>
            </aside>

            {/* ── RIGHT — form ──────────────────────────────────────────── */}
            <div className="px-6 pb-12 pt-24 sm:px-10 lg:pb-16 lg:pt-24">
              <div className="mx-auto max-w-xl">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Apply for an internship</h2>
                    <p className="mt-1 text-sm text-slate-500">Fields marked <span className="text-blue-600">*</span> are required.</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">Step {step + 1} of {STEPS.length}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-[width] duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} aria-hidden />
                </div>

                {lockedCollege ? (
                  <div className="mt-6 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3">
                    <School className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                    <p className="text-sm text-slate-600">
                      Dedicated application for <span className="font-semibold text-slate-900">{lockedCollege}</span> — tagged to your college.
                    </p>
                  </div>
                ) : null}

                <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8" aria-label="Intern application form">
                  {/* Step 1 — About you */}
                  <div className={step === 0 ? "space-y-5" : "hidden"}>
                    <Group label="About you">
                      <Field label="Full name" required name="name" autoComplete="name" placeholder="Anita Sharma" />
                      <Row>
                        <label className="block">
                          <LabelText label="WhatsApp number (with country code)" required />
                          <PhoneInput name="phone" required value={phoneVal} onChange={setPhoneVal} className={inputCls} />
                        </label>
                        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                      </Row>
                      <Row>
                        <Select label="Role you're applying for" name="role" options={ROLES} />
                        <Field label="City" name="city" autoComplete="address-level2" placeholder="Hyderabad" />
                      </Row>
                    </Group>
                  </div>

                  {/* Step 2 — Education */}
                  <div className={step === 1 ? "space-y-5" : "hidden"}>
                    <Group label="Education">
                      {lockedCollege ? (
                        <LockedField label="College / University" name="college" value={lockedCollege} />
                      ) : (
                        <Field label="College / University" name="college" placeholder="e.g. JNTU Hyderabad" />
                      )}
                      <Row>
                        <Field label="Branch / Degree" name="branch" placeholder="e.g. B.Tech CSE" />
                        <Select label="Year of study" name="year" options={YEARS} />
                      </Row>
                    </Group>
                  </div>

                  {/* Step 3 — Skills & work */}
                  <div className={step === 2 ? "space-y-8" : "hidden"}>
                    <Group label="Skills & availability">
                      <Textarea label="Your top skills" name="skills" placeholder="e.g. Python, React, prompt engineering, content writing, Figma…" rows={3} />
                      <Row>
                        <Select label="When can you start?" name="start" options={START} />
                        <Select label="Commitment" name="commit" options={COMMIT} />
                      </Row>
                    </Group>
                    <Group label="Your work" hint="optional">
                      <Row>
                        <Field label="Portfolio / website" name="portfolio" type="url" placeholder="https://…" />
                        <Field label="LinkedIn" name="linkedin" type="url" placeholder="linkedin.com/in/…" />
                      </Row>
                      <Field label="GitHub" name="github" type="url" placeholder="github.com/…" />

                      {/* Résumé — upload a file OR paste a link */}
                      <div>
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">Résumé</span>
                        {resumeUrl ? (
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2 font-medium text-green-800"><FileCheck2 className="h-4 w-4 shrink-0" /> <span className="truncate">{resumeName || "Résumé uploaded"}</span></span>
                            <button type="button" onClick={clearResume} className="shrink-0 font-semibold text-slate-500 hover:text-slate-700">Remove</button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
                            <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={onResumeFile} disabled={resumeStatus === "uploading"} />
                            {resumeStatus === "uploading" ? (
                              <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /> Uploading {resumeName}…</span>
                            ) : (
                              <>
                                <UploadCloud className="h-6 w-6 text-slate-400" aria-hidden />
                                <span className="text-sm font-semibold text-slate-700">Upload your résumé</span>
                                <span className="text-xs text-slate-400">PDF or Word · max 8 MB</span>
                              </>
                            )}
                          </label>
                        )}
                        {resumeErr ? <p className="mt-1.5 text-xs font-medium text-red-600">{resumeErr}</p> : null}
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or paste a link <span className="h-px flex-1 bg-slate-200" /></div>
                        <input name="resume" type="url" placeholder="Google Drive / Dropbox link — set access to “anyone with the link”" className={`${inputCls} mt-2`} />
                      </div>
                    </Group>
                  </div>

                  {/* Step 4 — Finish & submit */}
                  <div className={step === 3 ? "space-y-5" : "hidden"}>
                    <Group label="A little more">
                      <Textarea label="Why do you want to intern at ONROL?" name="why" placeholder="Tell us what excites you and what you'd love to work on." rows={4} />
                      <fieldset>
                        <legend className="mb-2 block text-sm font-medium text-slate-700">Preferred way to reach you</legend>
                        <div className="flex flex-wrap gap-2.5">
                          {["WhatsApp", "Email", "Phone"].map((c, i) => (
                            <label key={c} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600">
                              <input type="radio" name="commPref" value={c} defaultChecked={i === 0} className="accent-blue-600" />
                              {c}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </Group>
                    <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
                      <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-blue-600" />
                      <span>I agree to let ONROL contact me about my application via WhatsApp, email, or phone. <span className="text-blue-600">*</span></span>
                    </label>
                  </div>

                  {/* honeypot */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden
                    value={honey} onChange={(e) => setHoney(e.target.value)} className="absolute left-[-9999px] h-0 w-0 opacity-0" />

                  {error ? (
                    <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
                  ) : null}

                  {/* nav */}
                  <div className="mt-8 flex items-center gap-3">
                    {step > 0 ? (
                      <button type="button" onClick={goBack}
                        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400">
                        Back
                      </button>
                    ) : null}
                    {step < LAST ? (
                      <button type="button" onClick={goNext}
                        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Continue <ArrowRight className="h-5 w-5" />
                      </button>
                    ) : (
                      <button type="submit" disabled={busy}
                        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        {busy ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Submitting…</>)
                          : (<>Submit application <ArrowRight className="h-5 w-5" /></>)}
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-400">We review every application. No spam, ever.</p>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

/* ── Form building blocks ────────────────────────────────────────────── */
function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}{hint ? <span className="ml-2 font-medium normal-case tracking-normal text-slate-300">· {hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

const inputCls =
  "min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none";

function LabelText({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}{required ? <span className="text-blue-600"> *</span> : null}
    </span>
  );
}
function Field({ label, name, type = "text", placeholder, required, autoComplete }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <label className="block">
      <LabelText label={label} required={required} />
      <input type={type} name={name} placeholder={placeholder} required={required} autoComplete={autoComplete} className={inputCls} />
    </label>
  );
}
function LockedField({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="block">
      <LabelText label={label} />
      <div className="relative">
        <input name={name} defaultValue={value} readOnly aria-readonly
          className={`${inputCls} cursor-not-allowed border-blue-200 bg-blue-50/40 pr-24 font-medium`} />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
          Your college
        </span>
      </div>
    </label>
  );
}
function Textarea({ label, name, placeholder, rows = 3 }: { label: string; name: string; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <LabelText label={label} />
      <textarea name={name} placeholder={placeholder} rows={rows} className={`${inputCls} min-h-[auto] resize-y py-3 leading-relaxed`} />
    </label>
  );
}
function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <LabelText label={label} />
      <div className="relative">
        <select name={name} defaultValue="" className={`${inputCls} cursor-pointer appearance-none pr-10`}>
          <option value="" disabled>Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      </div>
    </label>
  );
}

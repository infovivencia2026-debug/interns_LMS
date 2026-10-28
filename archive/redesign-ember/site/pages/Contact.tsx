import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, GraduationCap, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Eyebrow, Faq, Lines, PageHero, SiteLayout, openWhatsApp, useLeadForm } from "../Site";

const channels = [
  { icon: Mail, label: "Email", value: "info@onrol.in", href: "mailto:info@onrol.in" },
  { icon: Phone, label: "Phone", value: "+91 96093 12345", href: "tel:+919609312345" },
  { icon: MapPin, label: "Location", value: "Hyderabad, India", href: "https://maps.google.com/?q=Hyderabad" },
];

function ContactForm() {
  const lead = useLeadForm();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const v = new FormData(form);
    const name = String(v.get("name")).trim(), email = String(v.get("email")).trim(), phone = String(v.get("phone")).trim(), message = String(v.get("message")).trim();
    if (await lead.save({ name, email, phone, source: "Contact page", campaign: "contact", notes: message, message }, "We couldn’t send your message just now. Please try again.")) {
      openWhatsApp(["Hi ONROL,", "", message, "", `Name: ${name}`, `Email: ${email}`, ...(phone ? [`Phone: ${phone}`] : [])]);
      form.reset();
    }
  }
  return <div className="ox-panel" id="message" data-reveal="right">
    <Eyebrow>Send a message</Eyebrow>
    <h2>Tell us what you’d like to know.</h2>
    <p>We save your message, then open WhatsApp with it ready to send.</p>
    {lead.state === "saved" && <p className="ox-form-ok" role="status" style={{ marginBottom: 16 }}><Check size={18} /> Message saved. WhatsApp has opened so you can send it.</p>}
    <form className="ox-form" onSubmit={submit} id="contactForm">
      <div className="row"><label>Full name<input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" /></label><label>Email<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@email.com" /></label></div>
      <label><span>Phone <small>(optional)</small></span><input name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" /></label>
      <label>Message<textarea name="message" required maxLength={1500} rows={5} placeholder="Tell us what you’d like to know…" /></label>
      {lead.error && <p className="ox-form-error" role="alert">{lead.error}</p>}
      <button className="ox-btn" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Sending…" : "Send via WhatsApp"} <ArrowRight size={18} /></button>
      <p className="ox-form-note">By sending, you agree to our <Link to="/privacy-policy">privacy policy</Link>.</p>
    </form>
  </div>;
}

export default function Contact() {
  return <SiteLayout seo={{ title: "Contact · ONROL", description: "Get in touch with ONROL — questions about programs, cohorts, and enrolment.", path: "/contact" }}>
    <PageHero eyebrow="Contact" crumbs={[["/", "Home"], ["/contact", "Contact"]]} title={<Lines><>Let’s</><em>connect.</em></Lines>} lede="Questions about a program, enrolment, or anything else? Reach out and the ONROL team gets back to you, usually within a few hours." />
    <section className="ox-sec is-cream">
      <div className="ox-wrap ox-split" style={{ alignItems: "start" }}>
        <div data-reveal="left">
          <Eyebrow>Whichever way you reach us, the same team answers</Eyebrow>
          <div className="ox-channels" style={{ marginTop: 28 }}>
            <a className="ox-channel is-wa" href="https://wa.me/918121306701" target="_blank" rel="noreferrer"><span className="ox-icon"><MessageCircle size={22} /></span><div><span>Fastest · typically replies within a few hours</span><strong>Chat on WhatsApp</strong></div><ArrowUpRight size={20} /></a>
            {channels.map(({ icon: Icon, label, value, href }) => <a key={label} className="ox-channel" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span className="ox-icon"><Icon size={22} /></span><div><span>{label}</span><strong>{value}</strong></div><ArrowUpRight size={20} /></a>)}
          </div>
          <div className="ox-card" style={{ marginTop: 20, display: "flex", gap: 16, alignItems: "flex-start" }}><span className="ox-icon"><GraduationCap size={22} /></span><p style={{ margin: 0 }}>Representing a college or institution? See <Link className="ox-link" to="/college-programs">college programs</Link> and <Link className="ox-link" to="/college-partnerships">partnerships</Link>.</p></div>
        </div>
        <ContactForm />
      </div>
    </section>
    <section className="ox-sec">
      <div className="ox-wrap ox-faq-grid">
        <div data-reveal><Eyebrow>Quick answers</Eyebrow><h2 style={{ marginTop: 20 }}>Before <em>you write.</em></h2><p className="ox-lede" style={{ marginTop: 20 }}>The questions people most often send us.</p></div>
        <Faq name="contact-faq" items={[
          ["How quickly will I hear back?", "Usually within a few hours on working days. WhatsApp is the fastest way to reach the team."],
          ["Is there a fee to apply?", "No. Applying is free and there is no payment at the application step. The team talks you through the fit, the next cohort date and the fee for your program."],
          ["Can I try a session before committing?", "Yes. The free 90-minute masterclass is open before any paid commitment."],
          ["Do you work with colleges and companies?", "Yes. Colleges can explore campus programs and partnerships; for anything else, send us a message and the right person will reply."],
        ]} />
      </div>
    </section>
  </SiteLayout>;
}

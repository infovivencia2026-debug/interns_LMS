import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, GraduationCap, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Faq, Label, PageHero, SiteLayout, openWhatsApp, useLeadForm } from "../Site";
import "./pages.css";

const channels = [
  { icon: Mail, label: "Email", value: "info@onrol.in", href: "mailto:info@onrol.in" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 96093 12345", href: "tel:+919609312345" },
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
  return <div className="lg-card ct-form" id="message">
    <Label>Send a message</Label>
    <h2>Tell us what you’d like to know.</h2>
    <p>We save your message, then open WhatsApp with it ready to send.</p>
    {lead.state === "saved" && <p className="lg-form-ok" role="status" style={{ marginBottom: 16 }}><Check size={18} /> Message saved. WhatsApp has opened so you can send it.</p>}
    <form className="lg-form" onSubmit={submit} id="contactForm">
      <div className="row"><label>Full name<input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" /></label><label>Email<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@email.com" /></label></div>
      <label>Phone <small>(optional)</small><input name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" /></label>
      <label>Message<textarea name="message" required maxLength={1500} rows={5} placeholder="Tell us what you’d like to know…" /></label>
      {lead.error && <p className="lg-form-error" role="alert">{lead.error}</p>}
      <button className="lg-btn orange" type="submit" disabled={lead.state === "saving"}>{lead.state === "saving" ? "Sending…" : "Send via WhatsApp"}</button>
      <p className="lg-form-note">By sending, you agree to our <Link to="/privacy-policy">privacy policy</Link>.</p>
    </form>
  </div>;
}

export default function Contact() {
  return <SiteLayout seo={{ title: "Contact · ONROL", description: "Get in touch with ONROL — questions about programs, cohorts, and enrolment.", path: "/contact" }}>
    <PageHero label="Contact" title={<>Let’s <em>connect.</em></>} lede="Questions about a program, enrollment, or anything else? Reach out and the ONROL team will get back to you, usually within a few hours." />
    <section className="lg-section">
      <div className="lg-wrap ct-grid">
        <div>
          <Label>Whichever way you reach us, the same team answers</Label>
          <div className="ct-channels" style={{ marginTop: 24 }}>
            {channels.map(({ icon: Icon, label, value, href }) => <a key={label} className="ct-channel" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span className="lg-icon"><Icon size={20} /></span><div><span>{label}</span><strong>{value}</strong></div><ArrowUpRight size={18} /></a>)}
            <a className="ct-channel ct-wa" href="https://wa.me/918121306701" target="_blank" rel="noreferrer"><span className="lg-icon"><MessageCircle size={20} /></span><div><span>Typically replies within a few hours</span><strong>Chat on WhatsApp</strong></div><ArrowUpRight size={18} /></a>
          </div>
          <div className="ct-note"><GraduationCap size={20} /><p>Representing a college or institution? See <Link to="/college-programs">college programs</Link> and <Link to="/college-partnerships">partnerships</Link>.</p></div>
        </div>
        <ContactForm />
      </div>
    </section>
    <section className="lg-section lg-wash">
      <div className="lg-wrap hm-faq">
        <div className="hm-faq-head"><Label>Quick answers</Label><h2>Before you write.</h2><p className="mute">The questions people most often send us.</p></div>
        <Faq items={[
          ["How quickly will I hear back?", "Usually within a few hours on working days. WhatsApp is the fastest way to reach the team."],
          ["Is there a fee to apply?", "No. Applying is free and there is no payment at the application step. The team will talk you through the fit, the next cohort date and the fee for your program."],
          ["Can I try a session before committing?", "Yes. The free 90-minute masterclass is open before any paid commitment."],
          ["Do you work with colleges and companies?", "Yes. Colleges can explore campus programs and partnerships; for anything else, send us a message and the right person will reply."],
        ]} />
      </div>
    </section>
  </SiteLayout>;
}

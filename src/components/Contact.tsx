"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Check, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/enquiry";
import { budgetOptions, serviceOptions, site } from "@/lib/site";
import { Eyebrow, Reveal } from "./ui";

const empty: Enquiry = { name: "", business: "", email: "", phone: "", service: "", message: "", budget: "" };
type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [data, setData] = useState<Enquiry>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // One change handler for every field: uses the input's name to update the right key.
  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    if (errors[name as keyof Enquiry]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateEnquiry(data);
    setErrors(found);
    if (Object.keys(found).length) {
      // Move focus to the first broken field so keyboard and screen-reader users land on it.
      const first = Object.keys(found)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: honeypot }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error || "Something went wrong.");
      }
      setStatus("sent");
      setData(empty);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "";

  return (
    <section id="contact" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Eyebrow index="06">Start a project</Eyebrow>
          <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5.5rem)]">
            Tell us what you&apos;re{" "}
            <span className="font-serif font-normal normal-case italic text-volt" style={{ fontStretch: "100%" }}>
              building
            </span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
            Share a few details about your business and your project. We&apos;ll get back to you personally to talk through
            the next steps. No obligation.
          </p>

          <ul className="mt-10 space-y-3">
            {site.email && (
              <ContactLine icon={<Mail className="h-4 w-4" />} label="Email" href={`mailto:${site.email}`} value={site.email} />
            )}
            {site.phone && (
              <ContactLine icon={<Phone className="h-4 w-4" />} label="Phone" href={`tel:${site.phone.replace(/\s/g, "")}`} value={site.phone} />
            )}
            {waLink && <ContactLine icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" href={waLink} value="Chat with us" />}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-2 p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  role="status"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-volt text-white shadow-[0_0_40px_rgba(79,109,255,0.7)]">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="display mt-8 text-4xl">Enquiry sent</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-mute">
                    Thanks for reaching out. We&apos;ve received your project details and will be in touch soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-8 rounded-full border border-line px-5 py-2.5 text-sm text-mute transition-colors hover:text-bone"
                  >
                    Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0 }} className="grid gap-6 sm:grid-cols-2">
                  <Field id="name" label="Full name" error={errors.name} required>
                    <input id="f-name" name="name" autoComplete="name" value={data.name} onChange={update} {...a11y("name", errors)} className={inputCls(errors.name)} />
                  </Field>
                  <Field id="business" label="Business name" optional error={errors.business}>
                    <input id="f-business" name="business" autoComplete="organization" value={data.business} onChange={update} {...a11y("business", errors)} className={inputCls(errors.business)} />
                  </Field>
                  <Field id="email" label="Email address" error={errors.email} required>
                    <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" value={data.email} onChange={update} {...a11y("email", errors)} className={inputCls(errors.email)} />
                  </Field>
                  <Field id="phone" label="Phone number" optional error={errors.phone}>
                    <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={data.phone} onChange={update} {...a11y("phone", errors)} className={inputCls(errors.phone)} />
                  </Field>
                  <Field id="service" label="What service are you interested in?" error={errors.service} required>
                    <select id="f-service" name="service" value={data.service} onChange={update} {...a11y("service", errors)} className={inputCls(errors.service)}>
                      <option value="" disabled>
                        Choose a service
                      </option>
                      {serviceOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="budget" label="Estimated budget" optional error={errors.budget}>
                    <select id="f-budget" name="budget" value={data.budget} onChange={update} {...a11y("budget", errors)} className={inputCls(errors.budget)}>
                      <option value="">Select a range</option>
                      {budgetOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="message" label="Tell us about your project" error={errors.message} required wide>
                    <textarea
                      id="f-message"
                      name="message"
                      rows={5}
                      value={data.message}
                      onChange={update}
                      placeholder="What does your business do, and what would you like to build?"
                      {...a11y("message", errors)}
                      className={`${inputCls(errors.message)} resize-y`}
                    />
                  </Field>

                  {/* Honeypot: hidden from people and screen readers, catches spam bots. */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    </label>
                  </div>

                  {status === "error" && (
                    <div role="alert" className="flex gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 sm:col-span-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        {serverError}{" "}
                        {site.email && (
                          <>
                            You can also email us directly at{" "}
                            <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                              {site.email}
                            </a>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col items-start justify-between gap-4 sm:col-span-2 sm:flex-row sm:items-center">
                    <p className="text-xs text-dim">Fields marked * are required.</p>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-volt px-7 py-4 font-medium text-white shadow-[0_10px_40px_-10px_rgba(79,109,255,0.8)] transition-colors hover:bg-[#6280ff] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          Send Enquiry
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const inputCls = (err?: string) =>
  `w-full rounded-xl border bg-ink px-4 py-3.5 text-bone placeholder:text-dim transition-colors focus:outline-none focus-visible:outline-none focus:ring-2 ${
    err ? "border-red-400/60 focus:ring-red-400/40" : "border-line hover:border-white/20 focus:border-volt focus:ring-volt/30"
  }`;

// Links each input to its error message for screen readers.
const a11y = (name: keyof Enquiry, errors: EnquiryErrors) => ({
  "aria-invalid": errors[name] ? true : undefined,
  "aria-describedby": errors[name] ? `e-${name}` : undefined,
});

function Field({
  id,
  label,
  error,
  required,
  optional,
  wide,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={`f-${id}`} className="mb-2 block text-sm text-mute">
        {label}
        {required && <span className="text-volt"> *</span>}
        {optional && <span className="text-dim"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`e-${id}`} className="mt-2 flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

function ContactLine({ icon, label, href, value }: { icon: React.ReactNode; label: string; href: string; value: string }) {
  return (
    <li>
      <a href={href} className="group flex items-center gap-4 rounded-xl border border-line p-4 transition-colors hover:border-white/20">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-3 text-volt">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{label}</span>
          <span className="block truncate text-bone">{value}</span>
        </span>
        <ArrowUpRight className="h-4 w-4 text-mute transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </li>
  );
}

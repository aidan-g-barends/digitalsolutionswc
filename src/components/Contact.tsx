"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/enquiry";
import { budgetOptions, nextSteps, serviceOptions, site } from "@/lib/site";
import { Label, Reveal, SplitHeading } from "./ui";

const empty: Enquiry = { name: "", business: "", email: "", phone: "", service: "", message: "", budget: "" };
type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [data, setData] = useState<Enquiry>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // One handler for every field: the input's "name" decides which value to update.
  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name as keyof Enquiry]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateEnquiry(data);
    setErrors(found);
    if (Object.keys(found).length) {
      // Jump to the first field that needs fixing.
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
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
    <section id="contact" className="bg-paper-2 py-24 text-ink sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label index="05">Start a project</Label>
          <SplitHeading
            text="Let's build something that sets your business apart."
            accent={["apart."]}
            className="display mt-6 text-[clamp(2.8rem,5.2vw,5rem)]"
          />
          <Reveal delay={0.15}>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-soft">
            Whether you need a professional website, an online store or a custom digital solution, let&apos;s turn your idea
            into something exceptional. Tell us a bit about it and we&apos;ll get back to you personally.
          </p>

          {/* What happens after you press send: removes the guesswork. */}
          <div className="mt-12">
            <p className="annot text-mute">What happens next</p>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, i) => (
                <li key={step} className="flex gap-4 leading-relaxed">
                  <span className="mt-[3px] font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-ink/85">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <dl className="mt-12 space-y-6 border-t border-line pt-8">
            {site.email && (
              <div>
                <dt className="annot text-mute">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${site.email}`} className="link-line font-display text-xl font-medium tracking-tight sm:text-2xl">
                    {site.email}
                  </a>
                </dd>
              </div>
            )}
            {site.phone && (
              <div>
                <dt className="annot text-mute">Phone</dt>
                <dd className="mt-1.5">
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-line font-display text-xl font-medium sm:text-2xl">
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            {waLink && (
              <div>
                <dt className="annot text-mute">WhatsApp</dt>
                <dd className="mt-1.5">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="link-line font-display text-xl font-medium sm:text-2xl">
                    Send us a message
                  </a>
                </dd>
              </div>
            )}
          </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative rounded-[14px] border border-line-strong bg-paper p-6 text-ink shadow-[0_40px_120px_-60px_rgba(79,109,255,0.35)] sm:p-10">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[30rem] flex-col items-start justify-center"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-[5px] bg-signal text-white">
                    <Check className="h-6 w-6" />
                  </span>
                  <h3 className="display mt-8 text-5xl">Thanks, we&apos;ve got it.</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-soft">
                    Your enquiry has been sent. We&apos;ll read it properly and get back to you soon.
                  </p>
                  <button type="button" onClick={() => setStatus("idle")} className="link-line mt-8 font-medium">
                    Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0 }} className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                  <Field id="name" label="Full name" error={errors.name} required>
                    <input id="f-name" name="name" autoComplete="name" value={data.name} onChange={update} {...a11y("name", errors)} className={inputCls(errors.name)} />
                  </Field>
                  <Field id="business" label="Business name" optional error={errors.business}>
                    <input id="f-business" name="business" autoComplete="organization" value={data.business} onChange={update} {...a11y("business", errors)} className={inputCls(errors.business)} />
                  </Field>
                  <Field id="email" label="Email address" error={errors.email} required>
                    <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" value={data.email} onChange={update} {...a11y("email", errors)} className={inputCls(errors.email)} />
                  </Field>
                  <Field id="phone" label="Phone number" optional error={errors.phone}>
                    <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={update} {...a11y("phone", errors)} className={inputCls(errors.phone)} />
                  </Field>
                  <fieldset
                    className="sm:col-span-2"
                    aria-invalid={errors.service ? true : undefined}
                    aria-describedby={errors.service ? "e-service" : undefined}
                  >
                    <legend className="block text-sm font-medium text-soft">
                      What service are you interested in?<span className="text-signal"> *</span>
                    </legend>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {serviceOptions.map((o, i) => (
                        <label
                          key={o}
                          className={`relative flex cursor-pointer items-center last:col-span-full gap-2.5 rounded-[5px] border px-3 py-3 text-[14px] leading-tight transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                            data.service === o
                              ? "border-signal bg-signal/10 text-ink"
                              : errors.service
                                ? "border-danger/60 text-soft hover:border-ink/40"
                                : "border-line-strong text-soft hover:border-ink/40 hover:text-ink"
                          }`}
                        >
                          <input
                            id={i === 0 ? "f-service" : undefined}
                            type="radio"
                            name="service"
                            value={o}
                            checked={data.service === o}
                            onChange={update}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden
                            className={`h-2.5 w-2.5 shrink-0 border transition-colors ${data.service === o ? "border-signal bg-signal" : "border-line-strong"}`}
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                    {errors.service && (
                      <p id="e-service" className="mt-2 text-xs text-danger">
                        {errors.service}
                      </p>
                    )}
                  </fieldset>
                  <Field id="budget" label="Estimated budget" optional error={errors.budget} wide>
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
                      rows={4}
                      value={data.message}
                      onChange={update}
                      placeholder="What does your business do, and what would you like to build?"
                      {...a11y("message", errors)}
                      className={`${inputCls(errors.message)} resize-y`}
                    />
                  </Field>

                  {/* Honeypot: hidden from people, catches spam bots that fill in every field. */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    </label>
                  </div>

                  {status === "error" && (
                    <div role="alert" className="flex gap-3 rounded-[5px] border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:col-span-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        {serverError}{" "}
                        {site.email && (
                          <>
                            You can also email us at{" "}
                            <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                              {site.email}
                            </a>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col-reverse items-start justify-between gap-4 sm:col-span-2 sm:flex-row sm:items-center">
                    <p className="text-xs text-mute">* Required</p>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group inline-flex w-full items-stretch rounded-[5px] font-medium text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                    >
                      <span className="flex h-14 flex-1 items-center justify-center rounded-l-[5px] bg-signal px-6 transition-colors duration-300 group-hover:bg-signal-hi">
                        {status === "sending" ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                          </span>
                        ) : (
                          <span className="roll">
                            <span>Send enquiry</span>
                            <span aria-hidden>Send enquiry</span>
                          </span>
                        )}
                      </span>
                      <span aria-hidden className="grid w-14 place-items-center rounded-r-[5px] border-l border-white/20 bg-signal transition-colors duration-300 group-hover:bg-signal-hi">
                        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-45" />
                      </span>
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

// Underlined fields (like a paper form) instead of boxes.
const inputCls = (err?: string) =>
  `w-full border-0 border-b bg-transparent px-0 py-2.5 text-lg text-ink placeholder:text-mute/70 transition-colors focus:outline-none focus-visible:outline-none ${
    err ? "border-danger" : "border-ink/25 hover:border-ink/50 focus:border-ink"
  }`;

// Connects each field to its error message for screen readers.
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
      <label htmlFor={`f-${id}`} className="block text-sm font-medium text-soft">
        {label}
        {required && <span className="text-signal"> *</span>}
        {optional && <span className="font-normal text-mute"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`e-${id}`} className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

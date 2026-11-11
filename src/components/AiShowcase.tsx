"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Bell, CalendarCheck, Mic, RotateCcw, Sparkles, UserCheck, MessageSquareText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OPEN_EVENT } from "./assistant/Assistant";
import { Button, Label, Reveal, SplitHeading, ease, useStill } from "./ui";

/**
 * "A website that sells while you sleep": shows off the AI assistant as a service.
 * The phone plays an example conversation (clearly labelled as an example) when it
 * scrolls into view, ending with the notification the business owner would receive.
 * The real assistant opens from the "Try it now" button.
 */

type Line = { who: "visitor" | "ai"; text: string };
const SCRIPT: Line[] = [
  { who: "visitor", text: "Hi, I run a small restaurant. Do I actually need a website?" },
  {
    who: "ai",
    text: "Most people check the menu online before they visit, so a simple site with your menu, hours and a booking button can fill more tables. How do people book at the moment?",
  },
  { who: "visitor", text: "Only by phone, and I miss calls when it's busy." },
  {
    who: "ai",
    text: "Online bookings would fix exactly that. Shall I set up a free 30-minute chat with the team to plan it? I have Thursday at 10:00 open.",
  },
  { who: "visitor", text: "Thursday at 10 is perfect." },
  { who: "ai", text: "Booked! You'll get the details by email. Speak soon." },
];

const FEATURES = [
  { icon: MessageSquareText, title: "Answers like your best salesperson", body: "Knows your services and prices, and handles questions and doubts, day or night." },
  { icon: UserCheck, title: "Captures every lead", body: "Collects names, numbers and what they need, and sends them straight to you." },
  { icon: CalendarCheck, title: "Books meetings for you", body: "Checks your real free times and books consultations without the back-and-forth." },
  { icon: Mic, title: "Talks out loud too", body: "Visitors can speak to it instead of typing, and hear the answers." },
];

export default function AiShowcase() {
  return (
    <section id="ai" className="relative overflow-hidden border-y border-line bg-paper-2 py-24 sm:py-32">
      {/* Soft signal-blue glow behind the phone. */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-signal/15 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <Label index="02">Built in, not bolted on</Label>
          <SplitHeading
            text="A website that sells while you sleep."
            accent={["sells"]}
            className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)]"
          />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-soft">
              It&apos;s 10pm and a potential client lands on your site. Instead of a contact form they might never fill in,
              they get an assistant that answers their questions, explains what you offer and books a meeting in your
              calendar. <span className="text-ink">This website has one. Yours can too.</span>
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="bg-paper-2 p-5">
                <Reveal delay={0.05 * i}>
                  <Icon aria-hidden className="h-5 w-5 text-signal" />
                  <h3 className="mt-4 font-medium text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button
              href="#contact"
              onClick={(e) => {
                // Open the real assistant instead of jumping to the form.
                e.preventDefault();
                window.dispatchEvent(new Event(OPEN_EVENT));
              }}
            >
              Try it now
            </Button>
            <a href="#contact" className="group inline-flex items-center gap-2 font-medium">
              <span className="link-line">Ask about one for your business</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <DemoPhone />
        </div>
      </div>
    </section>
  );
}

/** The phone that plays the example conversation once it's on screen. */
function DemoPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-25% 0px" });
  const still = useStill();
  const [shown, setShown] = useState(0); // how many lines are visible
  const [typing, setTyping] = useState(false);
  const [notified, setNotified] = useState(false);
  const [run, setRun] = useState(0); // bump to replay
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced motion shows everything at once (see "visible" below), so nothing to play.
    if (still || !inView) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      setShown(0);
      setNotified(false);
      await wait(600);
      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        if (SCRIPT[i].who === "ai") {
          setTyping(true);
          await wait(900 + Math.min(1400, SCRIPT[i].text.length * 12));
          if (cancelled) return;
          setTyping(false);
        } else {
          await wait(900);
        }
        if (cancelled) return;
        setShown(i + 1);
      }
      await wait(700);
      if (!cancelled) setNotified(true);
    })();
    return () => {
      cancelled = true;
      setTyping(false);
    };
  }, [inView, still, run]);

  const visible = still ? SCRIPT.length : shown;
  const showNote = still || notified;

  // Keep the newest message in view inside the phone.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: still ? "auto" : "smooth" });
  }, [visible, typing, still]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[22rem]">
      <p className="annot mb-4 flex items-center justify-between text-mute">
        <span>Example conversation</span>
        {showNote && !still && (
          <button type="button" onClick={() => setRun((r) => r + 1)} className="flex items-center gap-1.5 hover:text-ink">
            <RotateCcw className="h-3 w-3" /> Replay
          </button>
        )}
      </p>

      {/* Phone frame */}
      <div className="relative rounded-[2.6rem] bg-black p-[8px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset]">
        <div className="relative flex h-[34rem] flex-col overflow-hidden rounded-[2.1rem] bg-paper">
          <span aria-hidden className="absolute left-1/2 top-2.5 z-10 h-[22px] w-[32%] -translate-x-1/2 rounded-full bg-black" />
          {/* Assistant header, like the real one */}
          <div className="flex items-center gap-3 border-b border-line px-4 pb-3 pt-11">
            <div className="relative grid h-9 w-9 place-items-center rounded-[8px] bg-signal text-white">
              <Sparkles className="h-4 w-4" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-ok" />
            </div>
            <div>
              <p className="text-[13px] font-semibold">AI Assistant</p>
              <p className="annot !text-[8.5px] text-mute">Online now</p>
            </div>
          </div>

          <div ref={listRef} aria-hidden className="flex-1 space-y-3 overflow-hidden px-3.5 py-4">
            {SCRIPT.slice(0, visible).map((l, i) => (
              <motion.div
                key={`${run}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease }}
                className={`flex ${l.who === "visitor" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-[12px] px-3 py-2 text-[12.5px] leading-relaxed ${
                    l.who === "visitor" ? "rounded-br-[4px] bg-signal text-white" : "rounded-bl-[4px] border border-line bg-paper-2 text-soft"
                  }`}
                >
                  {l.text}
                </p>
              </motion.div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-[12px] rounded-bl-[4px] border border-line bg-paper-2 px-3 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-signal"
                      animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="h-9 rounded-[8px] border border-line-strong bg-paper-2" />
          </div>
        </div>
      </div>

      {/* What the business owner gets: a notification with the lead and the booking. */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute -bottom-6 -left-4 right-6 flex items-start gap-3 rounded-[12px] border border-line-strong bg-paper/95 p-3.5 shadow-2xl backdrop-blur-md sm:-left-12"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-ok text-white">
              <Bell className="h-4 w-4" />
            </span>
            <span className="min-w-0 text-[12.5px] leading-snug">
              <span className="block font-semibold text-ink">New lead: restaurant website</span>
              <span className="block text-mute">Consultation booked · Thursday 10:00</span>
            </span>
            <span className="annot ml-auto shrink-0 !text-[9px] text-mute">Your inbox</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

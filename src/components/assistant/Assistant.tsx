"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Keyboard, Mic, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { ease } from "../ui";
import Markdown, { toSpeech } from "./Markdown";
import { useVoice, type VoiceState } from "./useVoice";

type Msg = { id: string; role: "user" | "assistant"; text: string; error?: boolean };

const STORAGE = "dswc-assistant";
const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  text: `Hi! I'm the **DSWC AI Assistant**. I can tell you what we build, how our process works, and help you plan a website for your business.\n\nWhat kind of business do you run?`,
};
const SUGGESTIONS = [
  "I need a website for my business",
  "What does a website cost?",
  "Can you build an online store?",
  "Book a free consultation",
];

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Lets any button on the site open the assistant: window.dispatchEvent(new Event("dswc:assistant")). */
export const OPEN_EVENT = "dswc:assistant";

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [conversationId, setConversationId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [handsFree, setHandsFree] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Restore this visit's conversation (sessionStorage = cleared when the tab closes).
  useEffect(() => {
    let restored: { id: string; messages: Msg[] } | null = null;
    try {
      restored = JSON.parse(sessionStorage.getItem(STORAGE) || "null");
    } catch {
      /* ignore */
    }
    // Reading browser storage has to happen after the first render, so this setState is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversationId(restored?.id || uid());
    if (restored?.messages?.length) setMessages(restored.messages);

    // A small nudge after a while, once per visit.
    if (!sessionStorage.getItem(`${STORAGE}-seen`)) {
      const t = setTimeout(() => setTeaser(true), 9000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify({ id: conversationId, messages: messages.slice(-60) }));
    } catch {
      /* storage full or blocked: the chat still works */
    }
  }, [messages, conversationId]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const openChat = useCallback(() => {
    setOpen(true);
    setTeaser(false);
    try {
      sessionStorage.setItem(`${STORAGE}-seen`, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Open from anywhere on the site, close with Escape, lock page scroll on phones.
  useEffect(() => {
    const onOpen = () => openChat();
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [openChat]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeChat();
    window.addEventListener("keydown", onKey);
    const small = matchMedia("(max-width: 639px)").matches;
    if (small) document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (small) document.body.style.overflow = "";
    };
  }, [open, closeChat]);

  /** Sends a message and returns the assistant's reply text (used by voice mode too). */
  const send = useCallback(
    async (text: string, channel: "text" | "voice" = "text"): Promise<string | null> => {
      const clean = text.trim().slice(0, 1500);
      if (!clean || sending) return null;
      const userMsg: Msg = { id: uid(), role: "user", text: clean };
      const history = [...messages.filter((m) => !m.error), userMsg];
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setSending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            channel,
            messages: history.filter((m) => m.id !== "welcome").map(({ role, text }) => ({ role, text })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.reply) {
          const msg =
            data.error === "offline"
              ? `The assistant is offline right now. You can email us at ${site.email} or use the enquiry form below.`
              : data.error || "Sorry, something went wrong. Please try again.";
          setMessages((m) => [...m, { id: uid(), role: "assistant", text: msg, error: true }]);
          return msg;
        }
        setMessages((m) => [...m, { id: uid(), role: "assistant", text: data.reply }]);
        return data.reply as string;
      } catch {
        const msg = "I couldn't reach the server. Please check your connection and try again.";
        setMessages((m) => [...m, { id: uid(), role: "assistant", text: msg, error: true }]);
        return msg;
      } finally {
        setSending(false);
      }
    },
    [messages, conversationId, sending],
  );

  // ── Voice conversation loop: listen → send → speak the reply → listen again (hands-free).
  const live = useRef({ open, mode, handsFree });
  useEffect(() => {
    live.current = { open, mode, handsFree };
  }, [open, mode, handsFree]);

  const voice = useVoice({
    onFinal: async (text) => {
      const reply = await send(text, "voice");
      if (!reply || !live.current.open || live.current.mode !== "voice") {
        voice.setState("idle");
        return;
      }
      const finished = await voice.speak(toSpeech(reply));
      // Only start listening again if the reply was heard in full (not interrupted).
      if (finished && live.current.handsFree && live.current.open && live.current.mode === "voice") voice.listen();
    },
  });

  function startVoice() {
    setMode("voice");
    voice.unlockAudio();
    voice.listen();
  }
  function toText() {
    voice.stopAll();
    setMode("text");
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  // Closing the window silences everything.
  useEffect(() => {
    if (!open) voice.stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function clearChat() {
    voice.stopAll();
    setMessages([WELCOME]);
    setConversationId(uid());
    setInput("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter makes a new line.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  const showSuggestions = messages.length === 1 && !sending;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4, ease }}
            className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
          >
            <AnimatePresence>
              {teaser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease }}
                  className="relative max-w-[16rem] rounded-[10px] border border-line-strong bg-paper-2/95 p-3.5 pr-8 text-sm text-soft shadow-xl backdrop-blur-md"
                >
                  <button type="button" onClick={openChat} className="text-left">
                    <span className="font-medium text-ink">Planning a website?</span> Ask me anything, I&apos;ll reply in seconds.
                  </button>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => {
                      setTeaser(false);
                      sessionStorage.setItem(`${STORAGE}-seen`, "1");
                    }}
                    className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center text-mute hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              ref={launcherRef}
              type="button"
              onClick={openChat}
              aria-label="Open the DSWC AI Assistant"
              className="group relative flex h-14 items-center gap-2.5 rounded-[14px] bg-signal pl-4 pr-5 font-medium text-white shadow-[0_18px_50px_-12px_rgba(79,109,255,0.75)] transition-colors hover:bg-signal-hi"
            >
              <span aria-hidden className="absolute inset-0 animate-ping rounded-[14px] bg-signal opacity-20 [animation-duration:3s]" />
              <Sparkles className="relative h-5 w-5" />
              <span className="relative hidden sm:inline">Ask our AI</span>
              <span className="relative sm:hidden">Ask AI</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-modal="false"
            aria-label="DSWC AI Assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-paper/95 backdrop-blur-xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(42rem,calc(100dvh-3rem))] sm:w-[25rem] sm:rounded-[14px] sm:border sm:border-line-strong sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-line px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div aria-hidden className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-signal text-white">
                <Sparkles className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-paper bg-ok" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[15px] font-semibold tracking-tight">DSWC AI Assistant</p>
                <p className="annot !text-[9.5px] text-mute">Online now</p>
              </div>
              {voice.supported.listen && (
                <button
                  type="button"
                  onClick={() => (mode === "voice" ? toText() : startVoice())}
                  aria-label={mode === "voice" ? "Switch to typing" : "Switch to voice conversation"}
                  title={mode === "voice" ? "Type instead" : "Talk to the assistant"}
                  className={`grid h-9 w-9 place-items-center rounded-[5px] transition-colors ${
                    mode === "voice" ? "bg-signal text-white" : "text-mute hover:bg-paper-3 hover:text-ink"
                  }`}
                >
                  {mode === "voice" ? <Keyboard className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear the chat and start again"
                title="Start a new chat"
                className="grid h-9 w-9 place-items-center rounded-[5px] text-mute transition-colors hover:bg-paper-3 hover:text-ink"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close the assistant"
                className="grid h-9 w-9 place-items-center rounded-[5px] text-mute transition-colors hover:bg-paper-3 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] space-y-2 rounded-[12px] px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-[4px] bg-signal text-white"
                        : m.error
                          ? "rounded-bl-[4px] border border-danger/30 bg-danger/10 text-ink"
                          : "rounded-bl-[4px] border border-line bg-paper-2 text-soft"
                    }`}
                  >
                    {m.role === "user" ? <p className="whitespace-pre-wrap">{m.text}</p> : <Markdown text={m.text} />}
                  </div>
                </motion.div>
              ))}

              {sending && (
                <div className="flex justify-start" aria-label="The assistant is typing">
                  <div className="flex items-center gap-1.5 rounded-[12px] rounded-bl-[4px] border border-line bg-paper-2 px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-signal"
                        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-[8px] border border-line-strong px-3 py-1.5 text-[13px] text-soft transition-colors hover:border-signal hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input: voice panel or text box */}
            {mode === "voice" ? (
              <VoicePanel
                state={voice.state}
                transcript={voice.transcript}
                error={voice.error}
                handsFree={handsFree}
                onHandsFree={() => setHandsFree((v) => !v)}
                onOrb={() => {
                  voice.unlockAudio();
                  if (voice.state === "listening") voice.stopListening();
                  else if (voice.state === "thinking") return;
                  else voice.listen(); // idle, or speaking (tap to interrupt and talk)
                }}
                onStop={() => voice.stopAll()}
                onType={toText}
              />
            ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-line px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
            >
              <div className="flex items-end gap-2 rounded-[10px] border border-line-strong bg-paper-2 p-1.5 focus-within:border-signal">
                <label htmlFor="assistant-input" className="sr-only">
                  Message the assistant
                </label>
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={1500}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about websites, prices, timelines..."
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-ink outline-none placeholder:text-mute no-ring [field-sizing:content]"
                />
                {voice.supported.listen && (
                  <button
                    type="button"
                    onClick={startVoice}
                    aria-label="Talk instead of typing"
                    title="Talk to the assistant"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] text-mute transition-colors hover:bg-paper-3 hover:text-ink"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-signal text-white transition-opacity disabled:opacity-35"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[11px] text-mute">
                AI assistant. It can make mistakes, so important details are confirmed by our team.
              </p>
            </form>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

const VOICE_LABEL: Record<VoiceState, string> = {
  idle: "Tap to talk",
  listening: "Listening... tap when you're done",
  thinking: "Thinking...",
  speaking: "Speaking. Tap to interrupt",
};

/** The voice controls: one big button that shows whether the AI is listening, thinking or speaking. */
function VoicePanel({
  state,
  transcript,
  error,
  handsFree,
  onHandsFree,
  onOrb,
  onStop,
  onType,
}: {
  state: VoiceState;
  transcript: string;
  error: string;
  handsFree: boolean;
  onHandsFree: () => void;
  onOrb: () => void;
  onStop: () => void;
  onType: () => void;
}) {
  return (
    <div className="border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onOrb}
          aria-label={VOICE_LABEL[state]}
          className="relative grid h-20 w-20 place-items-center rounded-full bg-signal text-white shadow-[0_18px_50px_-12px_rgba(79,109,255,0.8)]"
        >
          {/* Listening: rings ripple out, like sound coming in. */}
          {state === "listening" &&
            [0, 1].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-signal"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
              />
            ))}
          {/* Thinking: a spinning arc. */}
          {state === "thinking" && (
            <motion.span
              aria-hidden
              className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-signal border-r-signal/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          )}
          {/* Speaking: equaliser bars. Otherwise: the mic. */}
          {state === "speaking" ? (
            <span aria-hidden className="flex h-7 items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-white"
                  animate={{ height: [6, 24, 10, 20, 6] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </span>
          ) : (
            <Mic className="relative h-7 w-7" />
          )}
        </button>

        <p className="annot mt-4 text-soft" aria-live="polite">
          {VOICE_LABEL[state]}
        </p>
        <p className="mt-2 min-h-[2.5rem] max-w-full text-[14px] leading-snug text-mute">
          {error ? <span className="text-danger">{error}</span> : transcript ? <span className="text-ink">&ldquo;{transcript}&rdquo;</span> : state === "idle" ? "Ask anything, out loud. Answers are read back to you." : ""}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[13px]">
        <label className="flex cursor-pointer items-center gap-2 text-soft">
          <input type="checkbox" checked={handsFree} onChange={onHandsFree} className="h-4 w-4 accent-[var(--color-signal)]" />
          Hands-free
        </label>
        <div className="flex items-center gap-1">
          {state !== "idle" && (
            <button type="button" onClick={onStop} className="flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-soft hover:bg-paper-3 hover:text-ink">
              <Square className="h-3.5 w-3.5" /> Stop
            </button>
          )}
          <button type="button" onClick={onType} className="flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-soft hover:bg-paper-3 hover:text-ink">
            <Keyboard className="h-3.5 w-3.5" /> Type instead
          </button>
        </div>
      </div>
    </div>
  );
}

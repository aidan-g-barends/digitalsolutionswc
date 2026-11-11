"use client";

/**
 * Voice for the assistant using the browser's built-in Web Speech API:
 *  - SpeechRecognition turns the visitor's voice into text (free, no API key)
 *  - speechSynthesis reads the AI's reply out loud (free, no API key)
 * Supported in Chrome, Edge and Safari (desktop and mobile). Firefox has no
 * speech recognition, so the UI falls back to typing there.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

// The Web Speech API isn't in TypeScript's built-in types yet, so we describe the bits we use.
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Picks the most natural English voice available on this device, preferring South African or British English. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (!voices.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    let s = 0;
    if (lang === "en-za") s += 6;
    else if (lang === "en-gb") s += 4;
    else if (lang === "en-us") s += 2;
    if (/natural|neural|premium|enhanced|google/.test(name)) s += 5; // the better-sounding voices
    if (/samantha|daniel|serena|libby|sonia|aria|jenny/.test(name)) s += 2;
    if (v.localService) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

/** Long text is split into sentences: Chrome cuts off single utterances after ~15 seconds. */
function sentences(text: string) {
  // Split only where punctuation is followed by a space, so "ivyhold.co.za" stays in one piece.
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

export function useVoice({ onFinal }: { onFinal: (text: string) => void }) {
  const [supported, setSupported] = useState({ listen: false, speak: false });
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const recRef = useRef<Recognition | null>(null);
  const finalRef = useRef("");
  const onFinalRef = useRef(onFinal);
  const speakIdRef = useRef(0);
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    // Feature detection has to run in the browser, after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported({ listen: Boolean(getRecognition()), speak: "speechSynthesis" in window });
    // Voices load asynchronously in some browsers; asking once warms the list up.
    if ("speechSynthesis" in window) speechSynthesis.getVoices();
    return () => {
      const rec = recRef.current;
      recRef.current = null;
      rec?.abort();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    speakIdRef.current++;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }, []);

  const listen = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome, Edge or Safari, or type instead.");
      return;
    }
    stopSpeaking();
    // Detach any previous recogniser first so its late "end" event is ignored.
    const prev = recRef.current;
    recRef.current = null;
    prev?.abort();
    setError("");
    setTranscript("");
    finalRef.current = "";

    const rec = new Ctor();
    rec.lang = "en-ZA";
    rec.interimResults = true; // show words as they're heard
    rec.continuous = false; // stop automatically when the visitor pauses
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((finalRef.current + " " + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow the microphone for this site in your browser settings, or type instead.");
      } else if (e.error === "no-speech") {
        setError("I didn't catch that. Tap the button and try again.");
      } else if (e.error !== "aborted") {
        setError("Voice input stopped unexpectedly. Tap to try again.");
      }
    };
    rec.onend = () => {
      if (recRef.current !== rec) return; // this recogniser was cancelled
      recRef.current = null;
      const text = finalRef.current.trim();
      if (text) {
        setState("thinking");
        onFinalRef.current(text);
      } else {
        setState("idle");
      }
    };
    recRef.current = rec;
    try {
      rec.start();
      setState("listening");
    } catch {
      setState("idle");
    }
  }, [stopSpeaking]);

  /** Stops listening early; whatever was heard so far is still sent. */
  const stopListening = useCallback(() => {
    recRef.current?.stop();
  }, []);

  /** Reads text aloud. Resolves true when it finished, false if it was interrupted. */
  const speak = useCallback(
    (text: string) =>
      new Promise<boolean>((resolve) => {
        if (!("speechSynthesis" in window) || !text) {
          setState("idle");
          return resolve(true);
        }
        speechSynthesis.cancel();
        const id = ++speakIdRef.current;
        const voice = pickVoice();
        const parts = sentences(text);
        setState("speaking");
        let i = 0;
        const next = () => {
          // Interrupted (stop pressed, or the visitor started talking again).
          if (id !== speakIdRef.current) return resolve(false);
          if (i >= parts.length) {
            setState("idle");
            return resolve(true);
          }
          const u = new SpeechSynthesisUtterance(parts[i++]);
          if (voice) u.voice = voice;
          u.lang = voice?.lang ?? "en-ZA";
          u.rate = 1.03;
          u.pitch = 1;
          u.onend = next;
          u.onerror = next;
          speechSynthesis.speak(u);
        };
        next();
      }),
    [],
  );

  /**
   * iPhones only allow speech that starts from a tap. Speaking a silent utterance
   * during the tap "unlocks" speech for the reply that arrives a few seconds later.
   */
  const unlockAudio = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    speechSynthesis.speak(u);
  }, []);

  /** Stops everything: listening, thinking display and speech. */
  const stopAll = useCallback(() => {
    const rec = recRef.current;
    recRef.current = null; // detached, so nothing heard so far gets sent
    rec?.abort();
    stopSpeaking();
    setState("idle");
    setTranscript("");
  }, [stopSpeaking]);

  return { supported, state, setState, transcript, error, listen, stopListening, speak, stopSpeaking, stopAll, unlockAudio };
}

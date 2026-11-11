/**
 * Renders the small amount of formatting the AI uses (bold, links, bullet and numbered
 * lists, line breaks) as real React elements. No HTML strings are injected, so a reply
 * can never smuggle in a script.
 */
import { Fragment } from "react";

// **bold**, [text](https://...), bare https:// links and email addresses.
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)\s]+\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function inline(text: string, keyBase: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const tok = m[0];
    if (m.index! > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-ink">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      out.push(<A key={key} href={href}>{label}</A>);
    } else if (tok.startsWith("http")) {
      // Don't swallow a full stop at the end of a sentence into the link.
      const clean = tok.replace(/[.,!?]+$/, "");
      out.push(<A key={key} href={clean}>{clean.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</A>);
      if (clean !== tok) out.push(tok.slice(clean.length));
    } else {
      const clean = tok.replace(/[.,!?]+$/, "");
      out.push(<A key={key} href={`mailto:${clean}`}>{clean}</A>);
      if (clean !== tok) out.push(tok.slice(clean.length));
    }
    last = m.index! + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="break-words text-signal underline decoration-signal/40 underline-offset-2 hover:decoration-signal"
    >
      {children}
    </a>
  );
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${blocks.length}`} className={`my-1.5 space-y-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-signal`}>
        {list.items.map((it, i) => (
          <li key={i}>{inline(it, `li${blocks.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const num = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || num) {
      const ordered = Boolean(num);
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
      return;
    }
    flush();
    if (!line) return;
    // Headings aren't wanted in chat; show them as bold lines if the AI uses one anyway.
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    blocks.push(
      <p key={`p${i}`} className={heading ? "font-semibold text-ink" : ""}>
        {inline(heading ? heading[1] : line, `p${i}`)}
      </p>,
    );
  });
  flush();

  return <Fragment>{blocks}</Fragment>;
}

/** Plain text for the speech engine: no markdown symbols or URLs read out loud. */
export function toSpeech(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/(www\.)?([^\s/)]+)[^\s)]*/g, "$2")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    // List items become short sentences, so they're read with a pause between them.
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+(.*?)([.!?:])?\s*$/gm, (_, item: string, end?: string) => `${item}${end ?? "."}`)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

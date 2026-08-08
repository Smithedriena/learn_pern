import React from "react";

// Very small markdown renderer: headings, bold, inline code, fenced code, paragraphs, lists.
export default function Markdown({ text }) {
  const html = renderMarkdown(text || "");
  return <div className="cq-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(src) {
  const lines = src.split("\n");
  const out = [];
  let inCode = false;
  let codeBuf = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    if (raw.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    if (/^\s*[-*]\s+/.test(raw)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      const item = raw.replace(/^\s*[-*]\s+/, "");
      out.push(`<li>${inline(item)}</li>`);
      continue;
    }
    flushList();
    if (raw.startsWith("### ")) out.push(`<h3>${inline(raw.slice(4))}</h3>`);
    else if (raw.startsWith("## ")) out.push(`<h2>${inline(raw.slice(3))}</h2>`);
    else if (raw.startsWith("# ")) out.push(`<h1>${inline(raw.slice(2))}</h1>`);
    else if (raw.trim() === "") out.push("");
    else out.push(`<p>${inline(raw)}</p>`);
  }
  flushList();
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  return out.join("\n");
}

function inline(s) {
  let x = escapeHtml(s);
  x = x.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  x = x.replace(/`([^`]+)`/g, "<code>$1</code>");
  return x;
}

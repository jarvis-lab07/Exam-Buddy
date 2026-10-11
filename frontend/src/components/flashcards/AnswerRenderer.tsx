"use client";

import React from "react";

interface AnswerRendererProps {
  answer: string;
  className?: string;
}

/**
 * Universal Answer Renderer for Exam-Buddy Flashcards
 * Intelligently renders comparison tables, structured bullet points, step sequences,
 * and key-definition highlights for effortless reading and rapid exam revision.
 */
export function AnswerRenderer({ answer, className = "" }: AnswerRendererProps) {
  if (!answer) return null;

  // Check if answer contains a markdown table
  const lines = answer.trim().split(/\r?\n/);
  const tableLines = lines.filter((l) => l.trim().startsWith("|") && l.trim().endsWith("|"));

  if (tableLines.length >= 2 && lines.some((l) => l.includes("|---|") || l.includes("|:---|") || l.includes("|---:|"))) {
    return renderMarkdownTable(lines, className);
  }

  // Otherwise render structured blocks
  return (
    <div className={`space-y-2.5 text-xs sm:text-sm leading-relaxed text-white font-normal ${className}`} style={{ color: "#ffffff" }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet points: • or -
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          const content = trimmed.replace(/^[•\-]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-400 font-bold text-sm leading-tight shrink-0">•</span>
              <div className="flex-1 text-slate-100">{renderFormattedInlineText(content)}</div>
            </div>
          );
        }

        // Numbered steps: 1. or [1] or Step 1:
        const stepMatch = trimmed.match(/^(?:(\d+)[.)]\s*|\[(\d+)\]\s*|Step\s*(\d+)[:.-]?\s*)(.*)$/i);
        if (stepMatch) {
          const stepNum = stepMatch[1] || stepMatch[2] || stepMatch[3];
          const stepContent = stepMatch[4];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-0.5">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300 shrink-0 mt-0.5">
                {stepNum}
              </span>
              <div className="flex-1 text-slate-100">{renderFormattedInlineText(stepContent)}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-100 font-normal">
            {renderFormattedInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses and renders Markdown tables into a sleek glassmorphic comparison table.
 */
function renderMarkdownTable(lines: string[], className: string) {
  const nonTableBlocks: string[] = [];
  const tableRows: string[][] = [];
  let headerRow: string[] = [];
  let isParsingTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Separator row like |---|---|
      if (trimmed.replace(/[\|\-\:\s]/g, "").length === 0) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!isParsingTable) {
        isParsingTable = true;
        headerRow = cells;
      } else {
        tableRows.push(cells);
      }
    } else {
      if (trimmed) nonTableBlocks.push(trimmed);
    }
  }

  return (
    <div className={`space-y-3 ${className}`} style={{ color: "#ffffff" }}>
      {nonTableBlocks.length > 0 && (
        <div className="space-y-1.5 text-xs sm:text-sm text-slate-200">
          {nonTableBlocks.map((b, i) => (
            <p key={i}>{renderFormattedInlineText(b)}</p>
          ))}
        </div>
      )}

      {/* Comparison Grid Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-white/15 bg-black/30 backdrop-blur-md shadow-lg">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          {headerRow.length > 0 && (
            <thead>
              <tr className="bg-emerald-950/40 border-b border-white/15">
                {headerRow.map((h, i) => (
                  <th
                    key={i}
                    className="p-2 sm:p-2.5 font-bold text-emerald-300 border-r border-white/10 last:border-r-0 tracking-wide"
                  >
                    {renderFormattedInlineText(h)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-white/10">
            {tableRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.05] hover:bg-white/[0.08]"}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="p-2 sm:p-2.5 text-slate-100 border-r border-white/10 last:border-r-0 align-top leading-relaxed"
                  >
                    {renderFormattedInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Highlights bold `**text**` and key prefixes `Key:` for effortless revision scanning.
 */
function renderFormattedInlineText(text: string) {
  // Pattern 1: Highlight **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-white text-emerald-200">
              {boldText}
            </strong>
          );
        }

        // Check if there is a colon key like "Key: Value"
        const colonMatch = part.match(/^([A-Za-z0-9\s\-_/]+:)(.*)$/);
        if (colonMatch && !part.includes("http")) {
          return (
            <React.Fragment key={index}>
              <span className="font-semibold text-emerald-300 mr-1">{colonMatch[1]}</span>
              <span>{colonMatch[2]}</span>
            </React.Fragment>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

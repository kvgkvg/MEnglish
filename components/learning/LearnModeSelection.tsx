"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle2, PenTool, Grid3x3, FileText, Clock, ArrowRight } from "lucide-react";
import { Pill } from "@/components/ui/pill";

interface LearnModeSelectionProps {
  setId: string;
  setName: string;
  wordCount: number;
  memoryScore?: number;
  masteredCount?: number;
  dueCount?: number;
}

interface LearningMode {
  id: string;
  name: string;
  description: string;
  time: string;
  href: string;
  recommended?: boolean;
  isNew?: boolean;
}

export function LearnModeSelection({
  setId,
  setName,
  wordCount,
  memoryScore = 0,
  masteredCount = 0,
  dueCount = 0,
}: LearnModeSelectionProps) {
  const modes: LearningMode[] = [
    {
      id: "flashcards",
      name: "Flashcards",
      description: "Spaced repetition with self-grading. Best for active recall.",
      time: "6 min",
      href: `/dashboard/learn/${setId}/learn/flashcards`,
      recommended: true,
    },
    {
      id: "multiple-choice",
      name: "Multiple choice",
      description: "Quick warmup. Choose the correct definition from 4 options.",
      time: "4 min",
      href: `/dashboard/learn/${setId}/learn/multiple-choice`,
    },
    {
      id: "write",
      name: "Type the word",
      description: "Recall from definition. Highest retention method.",
      time: "9 min",
      href: `/dashboard/learn/${setId}/learn/write`,
    },
    {
      id: "matching",
      name: "Match",
      description: "Pair words with definitions in a timed grid.",
      time: "3 min",
      href: `/dashboard/learn/${setId}/learn/matching`,
    },
    {
      id: "test",
      name: "Test mode",
      description: "Mixed question types for comprehensive practice.",
      time: "12 min",
      href: `/dashboard/learn/${setId}/learn/test`,
    },
  ];

  const sessionConfig = [
    { label: "Length", options: ["10", "20", "40", "∞"], active: 1 },
    { label: "Mix", options: ["Due only", "Due + new", "All"], active: 0 },
    { label: "Direction", options: ["Word→Def", "Def→Word", "Mixed"], active: 2 },
    { label: "Audio", options: ["Off", "On reveal", "Always"], active: 1 },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 24px 60px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Link
          href={`/dashboard/learn/${setId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "var(--mut)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={11} /> BACK TO SET
        </Link>
        <div
          style={{
            fontSize: 11,
            color: "var(--mut)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          SESSION SETUP
        </div>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "var(--ink)",
          }}
        >
          How do you want to{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            practice
          </span>
          ?
        </h1>
        <p style={{ fontSize: 13, color: "var(--mut)", marginTop: 8 }}>
          {setName} · {dueCount > 0 ? `${dueCount} due` : "no cards due"} · {wordCount} total · est. 4–12 min
        </p>
      </div>

      {/* Mode grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {modes.map((m, idx) => (
          <Link
            key={m.id}
            href={m.href}
            style={{
              display: "block",
              textDecoration: "none",
              padding: 18,
              borderRadius: 6,
              border: `0.5px solid ${m.recommended ? "color-mix(in oklch, var(--acc) 30%, var(--bd))" : "var(--bd)"}`,
              background: m.recommended
                ? "color-mix(in oklch, var(--acc) 6%, var(--card))"
                : "var(--card)",
              cursor: "pointer",
              transition: "background .15s",
            }}
          >
            {/* Title row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--mut)",
                  letterSpacing: "0.04em",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  flex: 1,
                  color: "var(--ink)",
                }}
              >
                {m.name}
              </h3>
              {m.recommended && <Pill tone="accent" size="xs">recommended</Pill>}
              {m.isNew && <Pill tone="warn" size="xs">new</Pill>}
            </div>

            <p
              style={{
                fontSize: 12,
                color: "var(--mut)",
                lineHeight: 1.5,
                minHeight: 36,
                marginBottom: 0,
              }}
            >
              {m.description}
            </p>

            {/* Footer */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "0.5px solid var(--bd)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--mut)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={10} /> {m.time}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--ink)",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Start <ArrowRight size={11} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Session config */}
      <div
        style={{
          background: "var(--card)",
          border: "0.5px solid var(--bd)",
          borderRadius: 6,
          padding: 14,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {sessionConfig.map((cfg) => (
            <div key={cfg.label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--mut)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {cfg.label}
              </div>
              <div
                style={{
                  display: "flex",
                  border: "0.5px solid var(--bd)",
                  borderRadius: 4,
                  padding: 1,
                }}
              >
                {cfg.options.map((opt, i) => (
                  <button
                    key={opt}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      fontSize: 11,
                      background: i === cfg.active ? "var(--ink)" : "transparent",
                      color: i === cfg.active ? "var(--bg)" : "var(--mut)",
                      border: 0,
                      borderRadius: 3,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

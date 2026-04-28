"use client";

import { useState, useEffect } from "react";
import { VocabWord } from "@/types";
import { SessionSummary } from "./SessionSummary";
import { Bar } from "@/components/ui/bar";
import { Pill } from "@/components/ui/pill";
import { Flame, X, Check, Volume2 } from "lucide-react";
import Link from "next/link";

interface FlashcardSessionProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

type Grade = "again" | "hard" | "good" | "easy";
interface CardResult {
  wordId: string;
  word: string;
  correct: boolean;
}

const GRADES: { id: Grade; label: string; sub: string; hint: string; tone: string }[] = [
  { id: "again", label: "Again", sub: "<1m", hint: "1", tone: "bad" },
  { id: "hard",  label: "Hard",  sub: "6m",  hint: "2", tone: "warn" },
  { id: "good",  label: "Good",  sub: "1d",  hint: "3", tone: "mut" },
  { id: "easy",  label: "Easy",  sub: "4d",  hint: "4", tone: "good" },
];

const GRADE_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  bad:  { bg: "color-mix(in oklch, var(--bad) 12%, var(--bg))",  fg: "var(--bad)",  border: "var(--bad)" },
  warn: { bg: "color-mix(in oklch, var(--warn) 12%, var(--bg))", fg: "var(--warn)", border: "var(--warn)" },
  mut:  { bg: "var(--mut2)",                                       fg: "var(--ink)",  border: "var(--bd)" },
  good: { bg: "color-mix(in oklch, var(--good) 12%, var(--bg))", fg: "var(--good)", border: "var(--good)" },
};

const SPARKLINE_COLORS: Record<Grade, string> = {
  easy:  "var(--good)",
  good:  "color-mix(in oklch, var(--good) 60%, var(--mut2))",
  hard:  "var(--warn)",
  again: "var(--bad)",
};

export function FlashcardSession({ setId, setName, words }: FlashcardSessionProps) {
  const [queue] = useState<VocabWord[]>(() => [...words].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const total = queue.length;
  const card = queue[idx % total];

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!revealed) {
        if (e.code === "Space") { e.preventDefault(); setRevealed(true); }
        if (e.key === "h" || e.key === "H") setHintLevel((l) => Math.min(2, l + 1));
      } else {
        if (e.key === "1") grade("again");
        if (e.key === "2") grade("hard");
        if (e.key === "3") grade("good");
        if (e.key === "4") grade("easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const grade = (g: Grade) => {
    const correct = g === "easy" || g === "good";
    const newResults = [...results, { wordId: card.id, word: card.word, correct }];
    const newGrades = [...grades, g];
    setResults(newResults);
    setGrades(newGrades);
    setStreak(correct ? streak + 1 : 0);
    setRevealed(false);
    setHintLevel(0);
    if (idx + 1 >= total) {
      setShowSummary(true);
    } else {
      setIdx(idx + 1);
    }
  };

  const handleRestart = () => {
    setIdx(0);
    setRevealed(false);
    setGrades([]);
    setResults([]);
    setHintLevel(0);
    setStreak(0);
    setElapsed(0);
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <SessionSummary
        setId={setId}
        setName={setName}
        results={results}
        onRestart={handleRestart}
      />
    );
  }

  const correctCount = grades.filter((g) => g === "easy" || g === "good").length;
  const incorrectCount = grades.filter((g) => g === "again" || g === "hard").length;
  const recentGrades = grades.slice(-8);
  const timerStr = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 48px)",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "var(--bg)",
      }}
    >
      {/* Top context strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: 16,
          padding: "12px 24px",
          borderBottom: "0.5px solid var(--bd)",
          alignItems: "center",
          background: "var(--card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href={`/dashboard/learn/${setId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 4,
              border: "0.5px solid var(--bd)",
              background: "transparent",
              color: "var(--mut)",
              fontSize: 11,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <X size={11} /> End session
          </Link>
          <span
            style={{
              fontSize: 11,
              color: "var(--mut)",
              fontFamily: "var(--font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {setName}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--mut)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 40,
            }}
          >
            {idx + 1}/{total}
          </span>
          <div style={{ flex: 1 }}>
            <Bar value={idx} max={total} height={4} />
          </div>
          <span
            style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--mut)" }}
          >
            {timerStr}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 14,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--mut)",
            alignItems: "center",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Flame size={11} /> {streak}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Check size={11} /> {correctCount}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <X size={11} /> {incorrectCount}
          </span>
          <span>·</span>
          <span style={{ color: "var(--acc)", fontWeight: 600 }}>+{idx * 8} XP</span>
        </div>
      </div>

      {/* Card area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 220px",
          gap: 24,
          padding: "30px 24px",
          alignItems: "start",
        }}
      >
        {/* Left rail — hints */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "var(--mut)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Hints
            <span style={{ color: "var(--mut)" }}>({hintLevel}/2)</span>
          </div>

          {[
            { label: "1 · Pronunciation", content: card.pronunciation ?? "—" },
            { label: "2 · Example", content: card.example_sentence ?? "—" },
          ].map((hint, hi) => (
            <button
              key={hi}
              onClick={() => setHintLevel(Math.max(hi + 1, hintLevel))}
              disabled={hintLevel > hi}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 5,
                border: "0.5px solid var(--bd)",
                background: "var(--card)",
                cursor: hintLevel > hi ? "default" : "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--mut)",
                }}
              >
                {hint.label}
              </div>
              {hintLevel > hi ? (
                <div
                  style={{
                    fontSize: hi === 1 ? 11 : 13,
                    marginTop: 4,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--ink)",
                    lineHeight: 1.4,
                  }}
                >
                  {hint.content}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "var(--mut)", marginTop: 4 }}>
                  tap to reveal
                </div>
              )}
            </button>
          ))}

          <div
            style={{
              fontSize: 10,
              color: "var(--mut)",
              marginTop: 4,
              fontFamily: "var(--font-mono)",
              lineHeight: 1.5,
            }}
          >
            each hint reduces XP by 30%
          </div>
        </div>

        {/* The card */}
        <div style={{ position: "relative" }}>
          {/* Deck shadow cards */}
          {[{ offset: 16, opacity: 0.25 }, { offset: 8, opacity: 0.5 }].map(({ offset, opacity }) => (
            <div
              key={offset}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate(${offset}px, ${offset}px)`,
                background: "var(--card)",
                border: "0.5px solid var(--bd)",
                borderRadius: 8,
                opacity,
                zIndex: -1,
              }}
            />
          ))}

          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 8,
              padding: "48px 56px",
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top row: tags + card meta */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div />
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--mut)",
                }}
              >
                card {idx + 1} of {total}
              </div>
            </div>

            {/* Content */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--mut)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                {revealed ? "Word" : "Definition"}
              </div>

              {revealed ? (
                <>
                  <div
                    style={{
                      fontSize: 62,
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      color: "var(--ink)",
                    }}
                  >
                    {card.word}
                  </div>
                  {card.pronunciation && (
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        color: "var(--mut)",
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {card.pronunciation}
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 3,
                          border: "0.5px solid var(--bd)",
                          background: "transparent",
                          color: "var(--mut)",
                          cursor: "pointer",
                        }}
                      >
                        <Volume2 size={11} />
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 24,
                      maxWidth: 480,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>
                      {card.definition}
                    </div>
                    {card.example_sentence && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--mut)",
                          fontFamily: "var(--font-serif)",
                          fontStyle: "italic",
                          marginTop: 10,
                          padding: "10px 14px",
                          background: "var(--mut2)",
                          borderRadius: 5,
                          borderLeft: "2px solid var(--acc)",
                          textAlign: "left",
                        }}
                      >
                        {card.example_sentence}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.4,
                      maxWidth: 520,
                      margin: "0 auto",
                      color: "var(--ink)",
                    }}
                  >
                    {card.definition}
                  </div>
                  {card.example_sentence && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--mut)",
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        marginTop: 18,
                        maxWidth: 480,
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    >
                      {card.example_sentence.replace(
                        new RegExp(`\\b${card.word}\\b`, "gi"),
                        "_______"
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reveal / prompt */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 20px",
                    borderRadius: 5,
                    background: "var(--ink)",
                    color: "var(--bg)",
                    fontSize: 12,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Reveal
                  <kbd
                    style={{
                      padding: "1px 6px",
                      borderRadius: 3,
                      border: "0.5px solid color-mix(in oklch, var(--bg) 40%, transparent)",
                      background: "color-mix(in oklch, var(--bg) 20%, transparent)",
                      color: "var(--bg)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Space
                  </kbd>
                </button>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--mut)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  How well did you remember it?
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right rail — recent answers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "var(--mut)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono)",
            }}
          >
            Recent answers
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const g = recentGrades[i];
              const color = g ? SPARKLINE_COLORS[g] : "var(--mut2)";
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 18,
                    borderRadius: 2,
                    background: color,
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--mut)",
              fontFamily: "var(--font-mono)",
            }}
          >
            last 8 cards
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              fontWeight: 500,
              color: "var(--mut)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono)",
            }}
          >
            Session
          </div>
          {[
            { label: "Correct", value: correctCount, color: "var(--good)" },
            { label: "Incorrect", value: incorrectCount, color: "var(--bad)" },
            { label: "Remaining", value: total - idx, color: "var(--ink)" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--mut)" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", color: s.color, fontWeight: 600 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grade bar */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "0.5px solid var(--bd)",
          background: "var(--card)",
        }}
      >
        {revealed ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            {GRADES.map((g) => {
              const c = GRADE_COLORS[g.tone];
              return (
                <button
                  key={g.id}
                  onClick={() => grade(g.id)}
                  style={{
                    appearance: "none",
                    border: `0.5px solid ${c.border}`,
                    background: c.bg,
                    color: c.fg,
                    padding: "10px 12px",
                    borderRadius: 5,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{g.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      opacity: 0.7,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {g.sub} ·{" "}
                    <kbd
                      style={{
                        padding: "0 4px",
                        borderRadius: 2,
                        border: `0.5px solid ${c.fg}`,
                        color: c.fg,
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        background: "transparent",
                      }}
                    >
                      {g.hint}
                    </kbd>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--mut)",
              fontFamily: "var(--font-mono)",
              padding: "4px 0",
              display: "flex",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {[
              { key: "Space", label: "reveal" },
              { key: "H", label: "hint" },
            ].map(({ key, label }) => (
              <span key={key}>
                <kbd
                  style={{
                    padding: "1px 6px",
                    borderRadius: 3,
                    border: "0.5px solid var(--bd)",
                    background: "var(--bg)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--mut)",
                  }}
                >
                  {key}
                </kbd>{" "}
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

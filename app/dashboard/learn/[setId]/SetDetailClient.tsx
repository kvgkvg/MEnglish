"use client";

import { useState } from "react";
import { VocabSet, VocabWord, LearningProgress } from "@/types";
import { Bar } from "@/components/ui/bar";
import { Pill } from "@/components/ui/pill";
import { AddWordsDialog } from "@/components/vocab-set/AddWordsDialog";
import { ImportCSVDialog } from "@/components/vocab-set/ImportCSVDialog";
import { ImportEssayDialog } from "@/components/vocab-set/ImportEssayDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, Sparkles, ChevronDown, Play, MoreVertical, Volume2, Star } from "lucide-react";
import Link from "next/link";
import { calculateSetMemoryScore } from "@/lib/algorithms/spaced-repetition";

interface SetDetailClientProps {
  vocabSet: VocabSet & { vocab_words?: VocabWord[] };
  words: VocabWord[];
  wordsWithProgress: Array<{ word: VocabWord; progress: LearningProgress | null }>;
}

type FilterTab = "all" | "due" | "learning" | "mastered" | "new";

function getDueLabel(progress: LearningProgress | null): { label: string; accent: boolean } {
  if (!progress) return { label: "new", accent: false };
  const next = new Date(progress.next_review_date);
  const now = new Date();
  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays <= 0) return { label: "today", accent: true };
  if (diffDays === 1) return { label: "tomorrow", accent: false };
  if (diffDays < 7) return { label: `${diffDays}d`, accent: false };
  return { label: `${Math.round(diffDays / 7)}w`, accent: false };
}

function getMasteryColor(score: number | null): string {
  if (score === null) return "var(--mut)";
  if (score < 40) return "var(--bad)";
  if (score < 80) return "var(--warn)";
  return "var(--good)";
}

export function SetDetailClient({ vocabSet, words, wordsWithProgress }: SetDetailClientProps) {
  const [addWordsOpen, setAddWordsOpen] = useState(false);
  const [importCSVOpen, setImportCSVOpen] = useState(false);
  const [importEssayOpen, setImportEssayOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [filterText, setFilterText] = useState("");

  const progressList = wordsWithProgress.map((w) => w.progress);
  const setMemoryScore = calculateSetMemoryScore(progressList);

  const isDueItem = (p: LearningProgress | null) =>
    !p || new Date(p.next_review_date) <= new Date();
  const wordsDue = wordsWithProgress.filter((w) => isDueItem(w.progress));
  const masteredCount = wordsWithProgress.filter((w) => w.progress && w.progress.memory_score >= 85).length;
  const learningCount = wordsWithProgress.filter(
    (w) => w.progress && w.progress.memory_score >= 30 && w.progress.memory_score < 85
  ).length;
  const newCount = wordsWithProgress.filter((w) => !w.progress).length;

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: wordsWithProgress.length },
    { id: "due", label: "Due", count: wordsDue.length },
    { id: "learning", label: "Learning", count: learningCount },
    { id: "mastered", label: "Mastered", count: masteredCount },
    { id: "new", label: "New", count: newCount },
  ];

  const filteredItems = wordsWithProgress.filter((item) => {
    if (filterText) {
      const q = filterText.toLowerCase();
      if (!item.word.word.toLowerCase().includes(q) && !item.word.definition.toLowerCase().includes(q))
        return false;
    }
    switch (filter) {
      case "due": return isDueItem(item.progress);
      case "learning":
        return item.progress && item.progress.memory_score >= 30 && item.progress.memory_score < 85;
      case "mastered": return item.progress && item.progress.memory_score >= 85;
      case "new": return !item.progress;
      default: return true;
    }
  });

  // Stacked mastery bar percentages
  const total = wordsWithProgress.length || 1;
  const masteredPct = Math.round((masteredCount / total) * 100);
  const learningPct = Math.round((learningCount / total) * 100);
  const stuckPct = Math.round(
    (wordsWithProgress.filter((w) => w.progress && w.progress.memory_score < 40).length / total) * 100
  );

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 24px 60px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: 11,
          color: "var(--mut)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        <Link href="/dashboard/learn" style={{ color: "var(--mut)", textDecoration: "none" }}>
          LIBRARY
        </Link>
        <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
        <span style={{ color: "var(--ink)" }}>{vocabSet.name.toUpperCase()}</span>
      </div>

      {/* Header 2-col */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 20,
          marginBottom: 16,
          alignItems: "start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            {vocabSet.name}
          </h1>
          {vocabSet.description && (
            <p
              style={{
                fontSize: 13,
                color: "var(--mut)",
                maxWidth: 540,
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                marginBottom: 14,
              }}
            >
              {vocabSet.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {wordsDue.length > 0 && (
              <Link
                href={`/dashboard/learn/${vocabSet.id}/learn`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 5,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <Play size={12} /> Study {wordsDue.length} due
              </Link>
            )}
            <Link
              href={`/dashboard/learn/${vocabSet.id}/learn`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 5,
                border: "0.5px solid var(--bd)",
                background: "transparent",
                color: "var(--ink)",
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Choose mode
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 10px",
                    borderRadius: 5,
                    border: "0.5px solid var(--bd)",
                    background: "transparent",
                    color: "var(--mut)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={11} /> Add words <ChevronDown size={10} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setAddWordsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add manually
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportCSVOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" /> Import CSV/TSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportEssayOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" /> AI Essay import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: 5,
                border: "0.5px solid var(--bd)",
                background: "transparent",
                color: "var(--mut)",
                cursor: "pointer",
              }}
            >
              <MoreVertical size={13} />
            </button>
          </div>
        </div>

        {/* Mastery breakdown card */}
        <div
          style={{
            background: "var(--card)",
            border: "0.5px solid var(--bd)",
            borderRadius: 6,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>
                Mastery
              </h3>
              <p style={{ fontSize: 11, color: "var(--mut)", marginTop: 2 }}>
                {masteredCount}/{words.length} words · {setMemoryScore}% score
              </p>
            </div>
          </div>
          {/* Stacked bar */}
          <div
            style={{
              display: "flex",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              background: "var(--mut2)",
              marginBottom: 10,
            }}
          >
            <div style={{ width: `${masteredPct}%`, background: "var(--good)" }} />
            <div style={{ width: `${learningPct}%`, background: "var(--warn)" }} />
            <div style={{ width: `${stuckPct}%`, background: "var(--bad)" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "var(--mut)",
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--good)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {masteredCount}
              </div>
              Mastered
            </div>
            <div>
              <div
                style={{
                  color: "var(--warn)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {learningCount}
              </div>
              Learning
            </div>
            <div>
              <div
                style={{
                  color: "var(--bad)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {wordsWithProgress.filter((w) => w.progress && w.progress.memory_score < 40).length}
              </div>
              Stuck
            </div>
            <div>
              <div
                style={{
                  color: "var(--mut)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {newCount}
              </div>
              New
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "0.5px solid var(--bd)",
          alignItems: "center",
        }}
      >
        {filterTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              appearance: "none",
              border: 0,
              borderBottom: `1.5px solid ${filter === t.id ? "var(--acc)" : "transparent"}`,
              background: "transparent",
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: filter === t.id ? "var(--ink)" : "var(--mut)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: -0.5,
            }}
          >
            {t.label}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--mut)",
                padding: "1px 5px",
                background: "var(--mut2)",
                borderRadius: 3,
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 6,
            alignItems: "center",
            padding: "4px 0",
          }}
        >
          <input
            placeholder="Filter words…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              background: "var(--mut2)",
              border: "0.5px solid var(--bd)",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              color: "var(--ink)",
              outline: "none",
              width: 160,
            }}
          />
        </div>
      </div>

      {/* Word table */}
      <div
        style={{
          background: "var(--card)",
          border: "0.5px solid var(--bd)",
          borderTop: 0,
          borderRadius: "0 0 6px 6px",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 200px 1fr 120px 80px 60px",
            gap: 14,
            padding: "8px 14px",
            background: "var(--mut2)",
            borderBottom: "0.5px solid var(--bd)",
            fontSize: 10,
            color: "var(--mut)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div />
          <div>Word</div>
          <div>Definition</div>
          <div>Mastery</div>
          <div>Due</div>
          <div />
        </div>

        {filteredItems.length === 0 && (
          <div
            style={{
              padding: "32px 14px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--mut)",
            }}
          >
            No words match this filter.
          </div>
        )}

        {filteredItems.map((item, i) => {
          const w = item.word;
          const p = item.progress;
          const score = p?.memory_score ?? null;
          const barColor = getMasteryColor(score);
          const { label: dueLabel, accent: dueAccent } = getDueLabel(p);

          return (
            <div
              key={w.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 200px 1fr 120px 80px 60px",
                gap: 14,
                padding: "12px 14px",
                borderTop: i > 0 ? "0.5px solid var(--bd)" : "none",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--mut)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(3, "0")}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {w.word}
                </div>
                {w.pronunciation && (
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--mut)",
                      marginTop: 1,
                    }}
                  >
                    {w.pronunciation}
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.4 }}>
                  {w.definition}
                </div>
                {w.example_sentence && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--mut)",
                      fontStyle: "italic",
                      marginTop: 2,
                      fontFamily: "var(--font-serif)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {w.example_sentence}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <Bar value={score ?? 0} max={100} color={barColor} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--mut)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {score !== null ? `${Math.round(score)}%` : "—"}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: dueAccent ? "var(--acc)" : "var(--mut)",
                }}
              >
                {dueLabel}
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <button
                  title="Listen"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: "0.5px solid var(--bd)",
                    background: "transparent",
                    color: "var(--mut)",
                    cursor: "pointer",
                  }}
                >
                  <Volume2 size={11} />
                </button>
                <button
                  title="Star"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: "0.5px solid var(--bd)",
                    background: "transparent",
                    color: "var(--mut)",
                    cursor: "pointer",
                  }}
                >
                  <Star size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <AddWordsDialog
        open={addWordsOpen}
        onOpenChange={setAddWordsOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
      <ImportCSVDialog
        open={importCSVOpen}
        onOpenChange={setImportCSVOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
      <ImportEssayDialog
        open={importEssayOpen}
        onOpenChange={setImportEssayOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
    </div>
  );
}

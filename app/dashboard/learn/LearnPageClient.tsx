"use client";

import { useState } from "react";
import { Folder, VocabSet, LearningProgress } from "@/types";
import { Bar } from "@/components/ui/bar";
import { Pill } from "@/components/ui/pill";
import { CreateSetDialog } from "@/components/vocab-set/CreateSetDialog";
import { CreateFolderDialog } from "@/components/vocab-set/CreateFolderDialog";
import { MoveSetDialog } from "@/components/vocab-set/MoveSetDialog";
import { ReviewCalendar } from "@/components/learning/ReviewCalendar";
import { Plus, Clock, Zap, Star, BookOpen, Play, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LearnPageClientProps {
  folders: Folder[];
  sets: (VocabSet & {
    wordCount?: number;
    masteredCount?: number;
    isDue?: boolean;
    memoryScore?: number;
  })[];
  setsForCalendar: Array<{
    set: VocabSet;
    progress: LearningProgress[];
    nextReviewDate: string | null;
  }>;
}

const FOLDER_COLORS = [
  "oklch(0.62 0.16 45)",
  "oklch(0.55 0.12 200)",
  "oklch(0.5 0.16 270)",
  "oklch(0.6 0.14 145)",
  "oklch(0.65 0.15 320)",
  "oklch(0.68 0.14 75)",
];

const getFolderColor = (folders: Folder[], folderId: string) => {
  const idx = folders.findIndex((f) => f.id === folderId);
  return FOLDER_COLORS[idx % FOLDER_COLORS.length] ?? FOLDER_COLORS[0];
};

export function LearnPageClient({ folders, sets, setsForCalendar }: LearnPageClientProps) {
  const router = useRouter();
  const [createSetOpen, setCreateSetOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [moveSetOpen, setMoveSetOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("all");

  const handleMoveSet = (set: VocabSet) => {
    setSelectedSet(set);
    setMoveSetOpen(true);
  };

  const filteredSets =
    activeFolder === "all" ? sets : sets.filter((s) => s.folder_id === activeFolder);
  const totalWords = filteredSets.reduce((a, s) => a + (s.wordCount ?? 0), 0);
  const dueCount = filteredSets.filter((s) => s.isDue).length;

  const smartLists = [
    { name: "Due today", count: sets.filter((s) => s.isDue).length, icon: Clock },
    { name: "Stuck (<60%)", count: sets.filter((s) => (s.memoryScore ?? 0) < 60).length, icon: Zap },
    { name: "Recently added", count: Math.min(sets.length, 5), icon: Plus },
    { name: "Starred", count: 0, icon: Star },
  ];

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "20px 24px 60px",
        display: "grid",
        gridTemplateColumns: "200px 1fr 320px",
        gap: 20,
      }}
    >
      {/* Sidebar */}
      <aside>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "var(--mut)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
            padding: "0 6px",
            fontFamily: "var(--font-mono)",
          }}
        >
          Folders
        </div>

        <SidebarItem
          active={activeFolder === "all"}
          onClick={() => setActiveFolder("all")}
          label="All sets"
          icon={<BookOpen size={12} />}
          count={sets.length}
        />

        {folders.map((f, i) => {
          const color = FOLDER_COLORS[i % FOLDER_COLORS.length];
          const due = sets.filter((s) => s.folder_id === f.id && s.isDue).length;
          return (
            <SidebarItem
              key={f.id}
              active={activeFolder === f.id}
              onClick={() => setActiveFolder(f.id)}
              label={f.name}
              icon={
                <span
                  style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }}
                />
              }
              count={due > 0 ? due : sets.filter((s) => s.folder_id === f.id).length}
              countAccent={due > 0}
            />
          );
        })}

        <button
          onClick={() => setCreateFolderOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: "5px 6px",
            borderRadius: 4,
            border: 0,
            background: "transparent",
            color: "var(--mut)",
            fontSize: 12,
            cursor: "pointer",
            gap: 8,
          }}
        >
          <Plus size={12} />
          New folder
        </button>

        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "var(--mut)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
            marginTop: 20,
            padding: "0 6px",
            fontFamily: "var(--font-mono)",
          }}
        >
          Smart lists
        </div>

        {smartLists.map((s) => {
          const Icon = s.icon;
          return (
            <SidebarItem
              key={s.name}
              active={false}
              onClick={() => {}}
              label={s.name}
              icon={<Icon size={12} />}
              count={s.count}
            />
          );
        })}
      </aside>

      {/* Main */}
      <main>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--mut)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
              }}
            >
              LIBRARY · {filteredSets.length} SETS · {totalWords} WORDS
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                marginTop: 2,
                color: "var(--ink)",
              }}
            >
              {activeFolder === "all"
                ? "All sets"
                : folders.find((f) => f.id === activeFolder)?.name ?? "Sets"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 5,
                border: "0.5px solid var(--bd)",
                background: "transparent",
                color: "var(--mut)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Filter size={11} /> Sort: Due first
            </button>
            <button
              onClick={() => setCreateSetOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 5,
                border: "0.5px solid var(--bd)",
                background: "transparent",
                color: "var(--mut)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Plus size={11} /> New set
            </button>
            {dueCount > 0 && (
              <Link
                href="/dashboard/learn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 5,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                  border: "none",
                }}
              >
                <Play size={11} /> Start session
              </Link>
            )}
          </div>
        </div>

        {/* Sets table */}
        {filteredSets.length === 0 ? (
          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 6,
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--mut)",
              fontSize: 13,
            }}
          >
            No sets yet.{" "}
            <button
              onClick={() => setCreateSetOpen(true)}
              style={{
                color: "var(--acc)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Create one →
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.4fr 1fr 0.8fr 0.8fr 1.4fr 0.8fr",
                gap: 12,
                padding: "8px 14px",
                borderBottom: "0.5px solid var(--bd)",
                fontSize: 10,
                color: "var(--mut)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono)",
                background: "var(--mut2)",
              }}
            >
              <div>Set</div>
              <div>Folder</div>
              <div>Words</div>
              <div>Due</div>
              <div>Mastery</div>
              <div />
            </div>

            {filteredSets.map((s, i) => {
              const folder = folders.find((f) => f.id === s.folder_id);
              const color = folder
                ? getFolderColor(folders, s.folder_id!)
                : "var(--mut)";
              const mastered = s.masteredCount ?? 0;
              const total = s.wordCount ?? 0;
              const score = s.memoryScore ?? 0;
              const barColor =
                score < 40 ? "var(--bad)" : score < 80 ? "var(--warn)" : "var(--good)";

              return (
                <div
                  key={s.id}
                  onClick={() => router.push(`/dashboard/learn/${s.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.4fr 1fr 0.8fr 0.8fr 1.4fr 0.8fr",
                    gap: 12,
                    padding: "10px 14px",
                    borderTop: i > 0 ? "0.5px solid var(--bd)" : "none",
                    alignItems: "center",
                    color: "var(--ink)",
                    transition: "background .15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "var(--mut2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        width: 6,
                        height: 24,
                        borderRadius: 1,
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--mut)",
                          fontFamily: "var(--font-mono)",
                          marginTop: 2,
                        }}
                      >
                        {total} words · {score}% score
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--mut)" }}>
                    {folder?.name ?? "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ink)",
                    }}
                  >
                    {total}
                  </div>
                  <div>
                    {s.isDue ? (
                      <Pill tone="accent" size="xs">due</Pill>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--mut)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Bar value={mastered} max={Math.max(total, 1)} color={barColor} />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--mut)",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 28,
                        textAlign: "right",
                      }}
                    >
                      {total > 0 ? Math.round((mastered / total) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Link
                      href={`/dashboard/learn/${s.id}/learn`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 3,
                        background: "var(--ink)",
                        color: "var(--bg)",
                        fontSize: 10,
                        fontWeight: 500,
                        textDecoration: "none",
                        border: "0.5px solid var(--ink)",
                      }}
                    >
                      <Play size={9} /> Study
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Folders grid */}
        {folders.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--mut)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              Folders
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {folders.map((f, i) => {
                const color = FOLDER_COLORS[i % FOLDER_COLORS.length];
                const folderSets = sets.filter((s) => s.folder_id === f.id);
                const due = folderSets.filter((s) => s.isDue).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFolder(f.id)}
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      padding: 14,
                      background: "var(--card)",
                      border: "0.5px solid var(--bd)",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{ width: 10, height: 10, borderRadius: 2, background: color }}
                      />
                      {due > 0 && <Pill tone="accent" size="xs">{due} due</Pill>}
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}
                    >
                      {f.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--mut)",
                        marginTop: 2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {folderSets.length} sets
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Right rail */}
      <aside>
        <ReviewCalendar sets={setsForCalendar} />
      </aside>

      {/* Dialogs */}
      <CreateSetDialog open={createSetOpen} onOpenChange={setCreateSetOpen} folders={folders} />
      <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} />
      <MoveSetDialog
        open={moveSetOpen}
        onOpenChange={setMoveSetOpen}
        set={selectedSet}
        folders={folders}
      />
    </div>
  );
}

function SidebarItem({
  active,
  onClick,
  label,
  icon,
  count,
  countAccent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  count?: number;
  countAccent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "5px 6px",
        borderRadius: 4,
        border: 0,
        background: active ? "var(--mut2)" : "transparent",
        color: active ? "var(--ink)" : "var(--mut)",
        fontSize: 12,
        cursor: "pointer",
        marginBottom: 1,
      }}
    >
      {icon}
      <span style={{ flex: 1, textAlign: "left", marginLeft: 8 }}>{label}</span>
      {count !== undefined && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: countAccent ? "var(--acc)" : "var(--mut)",
            fontWeight: countAccent ? 600 : 400,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

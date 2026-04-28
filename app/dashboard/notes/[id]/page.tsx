"use client";

import { useState, useEffect, use } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Note } from "@/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { useTheme } from "@/components/providers/ThemeProvider";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { ChevronLeft, Edit, Trash2 } from "lucide-react";

// Custom Minimalist Badge
interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "indigo" | "amber" | "secondary";
  className?: string;
}

const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  const variants = {
    default:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    secondary:
      "border border-neutral-200 text-neutral-600 dark:border-neutral-800 dark:text-neutral-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

// Custom Minimalist Button
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "outline" | "ghost";
  className?: string;
}

const Button = ({
  children,
  onClick,
  variant = "outline",
  className,
}: ButtonProps) => {
  const variants = {
    outline:
      "border border-neutral-200 bg-transparent hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900 dark:text-neutral-300",
    ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};

// 1. Unified Markdown Configuration (Handles DSA, Q&A, and General)
interface NoteMarkdownProps {
  content: string;
  resolvedTheme: string;
}

const NoteMarkdown = ({ content, resolvedTheme }: NoteMarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkBreaks]}
    components={{
      hr: () => (
        <hr className="my-10 border-t border-neutral-200 dark:border-neutral-800/60" />
      ),

      // Section Headers
      h1: ({ children }) => (
        <h1 className="mb-6 mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-4 mt-10 text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
          {children}
        </h2>
      ),

      // Text handling
      p: ({ children }) => (
        <p className="mb-5 leading-7 text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
          {children}
        </p>
      ),

      ul: ({ children }) => (
        <ul className="mb-5 ml-5 list-disc space-y-2.5 text-neutral-600 dark:text-neutral-400">
          {children}
        </ul>
      ),
      li: ({ children }) => <li className="pl-2">{children}</li>,

      strong: ({ children }) => (
        <strong className="font-semibold text-neutral-950 dark:text-neutral-100">
          {children}
        </strong>
      ),

      // Code Block & Inline Code
      code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        // Inline Code
        if (!match && !codeString.includes("\n")) {
          return (
            <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-medium text-indigo-600 dark:bg-neutral-800/50 dark:text-indigo-400 break-words border border-neutral-200/50 dark:border-neutral-700/50">
              {children}
            </code>
          );
        }

        // Full Code Block
        return (
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800/70 shadow-sm bg-neutral-100 dark:bg-neutral-950 ">
            {/* Optional: Add a "Language Indicator" header like your screenshot */}
            {/* <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-[#161b22] border-b border-neutral-200 dark:border-neutral-800/70">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                {match?.[1] || "text"}
              </span>
            </div> */}

            <CodeBlock
              language={match?.[1] || "text"}
              theme={resolvedTheme === "light" ? "light" : "dark"}
              // Ensure your CodeBlock component doesn't add its own extra padding
            >
              {codeString}
            </CodeBlock>
          </div>
        );
      },

      // Tables
      table: ({ children }) => (
        <div className="my-8 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800/80 shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b border-neutral-200 p-4 font-semibold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/50">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-neutral-100/50 p-4 text-neutral-600 dark:border-neutral-800/50 dark:text-neutral-400">
          {children}
        </td>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

// 2. Complexity Stats (For DSA)
const ComplexityCard = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-[10px] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900",
      className,
    )}
  >
    <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
      {label}
    </p>
    <p className="font-mono text-[14px] text-neutral-900 dark:text-neutral-100">
      {value || "O(1)"}
    </p>
  </div>
);

function NoteDisplay({
  note,
  topicTitle,
  topicId,
  resolvedTheme,
  onDelete,
  onEdit,
}: {
  note: Note;
  topicTitle: string | null;
  topicId: string | null;
  resolvedTheme: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [activeLang, setActiveLang] = useState(0);

  // Difficulty specific styles
  const difficultyMap = {
    Easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Medium:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Hard: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* --- HEADER --- */}
      <header className="mb-10 flex items-start justify-between border-b border-neutral-100 pb-8 dark:border-neutral-800/60">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/notes"
            className="rounded-xl border border-neutral-200 p-2.5 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {note.title}
            </h1>
            <p className="mt-1.5 text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onEdit(note.id)}>
            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            onClick={() => onDelete(note.id)}
            className="text-red-500 hover:text-red-600 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </header>

      {/* --- METADATA --- */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <Badge variant="indigo">{note.type.toUpperCase()}</Badge>
        {note.type === "dsa" && note.dsa ? (
          <>
            <Badge variant="secondary">{note.dsa.platform}</Badge>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase",
                difficultyMap[note.dsa.difficulty],
              )}
            >
              {note.dsa.difficulty}
            </span>
          </>
        ) : null}
        {note.tags?.map((tag) => (
          <Link
            key={tag}
            href={`/dashboard/notes?search=${encodeURIComponent(tag)}`}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
          >
            #{tag}
          </Link>
        ))}
        {topicTitle && topicId && (
          <Link
            href={`/dashboard/topics/${topicId}`}
            className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {topicTitle}
          </Link>
        )}
      </div>

      {/* --- CONTENT --- */}
      <main className="max-w-4xl mx-auto space-y-16">
        {note.type === "dsa" && note.dsa && (
          <div className="space-y-12">
            {/* Problem Statement Section */}
            {note.dsa.problemStatement && (
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-1 bg-indigo-600 rounded-full" />
                  <h4 className="text-xl font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-200">
                    Problem Statement
                  </h4>
                </div>
                <div className="">
                  <NoteMarkdown
                    content={note.dsa.problemStatement}
                    resolvedTheme={resolvedTheme}
                  />
                </div>
              </section>
            )}

            {/* Implementation Tabs */}
            {note.dsa.implementations?.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-indigo-600 rounded-full" />
                  <h4 className="text-xl font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                    Implementations
                  </h4>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
                  {/* Tab Header */}
                  <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-2">
                    {note.dsa.implementations.map((impl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveLang(idx)}
                        className={cn(
                          "relative px-6 py-4 text-sm font-bold capitalize tracking-tighter transition-all",
                          activeLang === idx
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200",
                        )}
                      >
                        {impl.language}
                        {activeLang === idx && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Code Content */}
                  <div className="p-0">
                    {/* Bypass NoteMarkdown to avoid redundant borders/headers */}
                    <CodeBlock
                      language={
                        note.dsa.implementations[
                          activeLang
                        ]?.language.toLowerCase() || "text"
                      }
                      minimal={true}
                      theme={resolvedTheme === "light" ? "light" : "dark"}
                    >
                      {note.dsa.implementations[activeLang]?.code || ""}
                    </CodeBlock>
                  </div>
                </div>

                {/* Complexity Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ComplexityCard
                    label="Time Complexity"
                    value={
                      note.dsa.implementations[activeLang]?.timeComplexity ||
                      note.dsa.timeComplexity ||
                      "O(N)"
                    }
                    className="bg-neutral-50/30 dark:bg-neutral-900/10 border-neutral-200 dark:border-neutral-800"
                  />
                  <ComplexityCard
                    label="Space Complexity"
                    value={
                      note.dsa.implementations[activeLang]?.spaceComplexity ||
                      note.dsa.spaceComplexity ||
                      "O(1)"
                    }
                    className="bg-neutral-50/30 dark:bg-neutral-900/10 border-neutral-200 dark:border-neutral-800"
                  />
                </div>
              </section>
            )}

            {note.dsa.notes && (
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-6 w-1 rounded-full bg-indigo-600" />
                  <h4 className="text-xl font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                    Notes
                  </h4>
                </div>
                <NoteMarkdown
                  content={note.dsa.notes}
                  resolvedTheme={resolvedTheme}
                />
              </section>
            )}
          </div>
        )}

        {/* General/QA Content Body */}
        {(note.type === "general" || note.type === "qa") && (
          <section className="min-h-[400px]">
            <NoteMarkdown
              content={note.content || note.qa?.content || ""}
              resolvedTheme={resolvedTheme}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [topicTitle, setTopicTitle] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`, { signal });
        if (response.ok) {
          const data = await response.json();
          setNote(data.note);
          if (data.note.topicId) {
            const topicResponse = await fetch(`/api/topics/${data.note.topicId}`, { signal });
            if (topicResponse.ok) {
              const topicData = await topicResponse.json();
              setTopicTitle(topicData.topic.title);
            }
          } else {
            setTopicTitle(null);
          }
        } else if (response.status === 404) {
          router.push("/dashboard");
        } else {
          console.error("Error fetching note");
          router.push("/dashboard");
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching note:", error);
          router.push("/dashboard");
        }
      } finally {
        if (!signal.aborted) {
          setIsDataLoading(false);
        }
      }
    };

    fetchNote();

    return () => controller.abort();
  }, [user, id, router]);

  const handleDelete = async () => {
    if (!note) return;
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/notes");
      } else {
        alert("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700 dark:border-neutral-800 dark:border-t-neutral-200" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <>
      <NoteDisplay
        note={note}
        resolvedTheme={resolvedTheme}
        topicTitle={topicTitle}
        topicId={note.topicId || null}
        onEdit={(id) => {
          router.push(`/dashboard/notes/${note.id}/edit`);
        }}
        onDelete={(id) => {
          handleDelete();
        }}
      />
    </>
  );
}

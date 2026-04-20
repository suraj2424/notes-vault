"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Note } from "@/types";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Star,
  Tag,
  Copy,
  Check,
  Code2,
  Clock,
  Layers,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { useTheme } from "@/components/providers/ThemeProvider";
import remarkGfm from "remark-gfm";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeLang, setActiveLang] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNote(data.note);
        } else if (response.status === 404) {
          router.push("/dashboard");
        } else {
          console.error("Error fetching note");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        router.push("/dashboard");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchNote();
  }, [user, id, router]);

  const toggleFavorite = async () => {
    if (!note) return;
    try {
      const newFavoriteStatus = !note.isFavorite;
      const response = await fetch(`/api/notes/${note!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newFavoriteStatus }),
      });

      if (response.ok) {
        setNote({ ...note, isFavorite: newFavoriteStatus });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      const response = await fetch(`/api/notes/${note!.id}`, {
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-400 dark:border-[#2a2a2a] dark:border-t-[#555555]" />
      </div>
    );
  }

  if (!note) return null;

  // Get unique languages from implementations
  const languages =
    note.type === "dsa" && note.dsa
      ? [...new Set(note.dsa.implementations.map((i) => i.language))]
      : [];
  const activeImplementation =
    note.type === "dsa" && note.dsa
      ? note.dsa.implementations[activeLang]
      : null;

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between border-b border-neutral-100 pb-6 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/notes"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1
              className={cn(
                "text-[22px] tracking-tight text-neutral-900 dark:text-neutral-100",
                dmSerif.className,
              )}
            >
              {note.title}
            </h1>
            <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-500">
              Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors",
              note.isFavorite
                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                : "text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:text-neutral-500 dark:hover:bg-amber-950/30",
            )}
          >
            <Star
              className={cn("h-4 w-4", note.isFavorite && "fill-amber-500")}
            />
          </button>
          <Link
            href={`/dashboard/notes/${note.id}/edit`}
            className="flex items-center gap-1.5 rounded-[7px] border border-neutral-200 px-3 h-9 text-[13.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 rounded-[7px] border border-neutral-200 px-3 h-9 text-[13.5px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:border-red-200 dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:border-red-900"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      {/* Blueprint Row 1: Badges & Tags */}
      <div className="mb-6 flex items-center justify-between dark:border-neutral-800">
        {/* Left: Type, Difficulty, Platform, Pattern */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">{note.type.toUpperCase()}</Badge>

          {note.type === "dsa" && note.dsa && (
            <>
              <Badge variant="blue">{note.dsa.platform}</Badge>
              <span
                className={cn(
                  "px-2.5 py-0.5 text-[11.5px] font-medium uppercase tracking-wider rounded-full",
                  note.dsa.difficulty === "Easy"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : note.dsa.difficulty === "Medium"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                )}
              >
                {note.dsa.difficulty}
              </span>
              {note.dsa.pattern?.split(",").map((p, i) =>
                p.trim() ? (
                  <Badge key={i} variant="neutral">
                    {p.trim()}
                  </Badge>
                ) : null,
              )}
            </>
          )}

          {note.type === "qa" && note.qa && note.qa.topic && (
            <Badge variant="amber">{note.qa.topic}</Badge>
          )}
        </div>

        {/* Right: Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-neutral-400 dark:text-[#555555]" />
            {note.tags.map((tag) => (
              <Link
                key={tag}
                href={`/dashboard/notes?search=${encodeURIComponent(tag)}`}
                className="text-[12.5px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-0.5 rounded-full transition-colors dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
      {note.type === "dsa" && note.dsa && (
        <div className="space-y-5">
          {/* Problem Statement - Full Width */}
          {note.dsa.problemStatement && (
            <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="max-w-none text-[14px] text-neutral-700 dark:text-neutral-300">
                <ReactMarkdown
                  // remarkPlugins={[remarkGfm]} // Highly recommended for tables/tasklists
                  components={{
                    // --- HEADINGS ---
                    h1: ({ children }) => (
                      <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                        {children}
                      </h3>
                    ),

                    // --- TEXT ELEMENTS ---
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </strong>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-blue-600 underline decoration-neutral-400 underline-offset-4 hover:text-blue-500 dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),

                    // --- LISTS ---
                    ul: ({ children }) => (
                      <ul className="mb-4 ml-6 list-disc space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-6 list-decimal space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,

                    // --- BLOCKQUOTES & HR ---
                    blockquote: ({ children }) => (
                      <blockquote className="my-4 border-l-4 border-neutral-300 pl-4 italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
                    ),

                    // --- CODE RENDERING ---
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const codeString = String(children).replace(/\n$/, "");
                      const isInline = !match && !codeString.includes("\n");

                      if (isInline) {
                        return (
                          <code
                            className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="my-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
                        </div>
                      );
                    },

                    // --- TABLES (Requires remark-gfm) ---
                    table: ({ children }) => (
                      <div className="my-6 overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-neutral-200 p-2 font-semibold dark:border-neutral-700">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-neutral-200 p-2 dark:border-neutral-700">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {note.dsa.problemStatement}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Complexity - Two Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Time Complexity
              </p>
              <p className="font-mono text-[14px] text-neutral-900 dark:text-neutral-100">
                {note.dsa.timeComplexity || "O(1)"}
              </p>
            </div>
            <div className="rounded-[10px] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Space Complexity
              </p>
              <p className="font-mono text-[14px] text-neutral-900 dark:text-neutral-100">
                {note.dsa.spaceComplexity || "O(1)"}
              </p>
            </div>
          </div>

          {/* Implementation Tabs */}
          {languages.length > 0 && (
            <div className="space-y-3">
              {/* Tab Headers */}
              <div className="flex gap-2">
                {languages.map((lang, idx) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(idx)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-9 text-[13.5px] font-medium rounded-[7px] border transition-colors",
                      activeLang === idx
                        ? "border-neutral-200 bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Code2 className="h-4 w-4" />
                    {lang}
                  </button>
                ))}
              </div>

              {/* Code Editor */}
              {activeImplementation && (
                <CodeBlock
                  language={activeImplementation.language}
                  theme={resolvedTheme === "light" ? "light" : "dark"}
                >
                  {activeImplementation.code}
                </CodeBlock>
              )}
            </div>
          )}

          {/* Notes / Key Takeaways */}
          {note.dsa.notes && (
            <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-5 text-[12px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Notes
              </h3>
              <div className="text-[14px] leading-relaxed">
                <ReactMarkdown
                  components={{
                    // --- HEADINGS (Added margins for hierarchy) ---
                    h1: ({ children }) => (
                      <h1 className="mb-6 mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-8 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-3 mt-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                        {children}
                      </h3>
                    ),

                    // --- TEXT & LISTS (Added mb-4 for paragraph spacing) ---
                    p: ({ children }) => (
                      <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </p>
                    ),

                    ul: ({ children }) => (
                      <ul className="mb-4 ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-6 list-decimal space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,

                    strong: ({ children }) => (
                      <strong className="font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </strong>
                    ),

                    // --- CODE HANDLING ---
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const codeString = String(children).replace(/\n$/, "");
                      const isInline = !match && !codeString.includes("\n");

                      if (isInline) {
                        return (
                          <code
                            className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="my-5">
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
                        </div>
                      );
                    },

                    // --- BLOCKQUOTES & HR ---
                    blockquote: ({ children }) => (
                      <blockquote className="my-6 border-l-4 border-neutral-200 pl-4 italic text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
                    ),

                    // --- TABLES ---
                    table: ({ children }) => (
                      <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <table className="w-full border-collapse text-left text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-neutral-200 p-2.5 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-neutral-200 p-2.5 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {note.dsa.notes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Q&A Content */}

      {note.type === "qa" && note.qa && (
        <div className="space-y-8">
          {/* Main Content Area */}
          {note.qa.content && (
            <div className="">
              <div className="max-w-none text-[14px] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // --- HEADINGS ---
                    h1: ({ children }) => (
                      <h1 className="mb-6 mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-8 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-3 mt-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                        {children}
                      </h3>
                    ),

                    // --- TEXT & LISTS ---
                    p: ({ children }) => (
                      <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-6 list-decimal space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-bold text-neutral-900 dark:text-neutral-100">
                        {children}
                      </strong>
                    ),

                    // --- CODE ---
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const codeString = String(children).replace(/\n$/, "");
                      const isInline = !match && !codeString.includes("\n");

                      if (isInline) {
                        return (
                          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="my-5">
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
                        </div>
                      );
                    },

                    // --- TABLES ---
                    table: ({ children }) => (
                      <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <table className="w-full border-collapse text-left text-[13px]">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="border-b border-neutral-200 p-3 font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border-b border-neutral-100 p-3 text-neutral-700 dark:border-neutral-800/50 dark:text-neutral-300">
                        {children}
                      </td>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="my-6 border-l-4 border-neutral-200 pl-4 italic text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {note.qa.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Key Takeaways Section */}
          {note.qa.importantPoints &&
            note.qa.importantPoints.filter((p) => p.trim()).length > 0 && (
              <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/30">
                <h3 className="mb-4 text-[12px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  {note.qa.importantPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[14px] leading-snug text-neutral-700 dark:text-neutral-300"
                    >
                      <div className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 items-center justify-center rounded-full bg-neutral-400 dark:bg-neutral-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
      {/* General Content */}
      {note.type === "general" && note.content && (
        <div className="">
          <div className="max-w-none text-[14px] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // --- FIX: Horizontal Rule (Line Break) ---
                hr: () => (
                  <hr className="my-8 border-t border-neutral-200 dark:border-neutral-800" />
                ),

                // --- TABLE RENDERING ---
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <table className="w-full border-collapse text-left text-[13px]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="border-b border-neutral-200 p-3 font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b border-neutral-100 p-3 text-neutral-700 dark:border-neutral-800/50 dark:text-neutral-300">
                    {children}
                  </td>
                ),

                // --- HEADINGS ---
                h1: ({ children }) => (
                  <h1 className="mb-6 mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-4 mt-8 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {children}
                  </h2>
                ),

                // --- TEXT & LISTS ---
                p: ({ children }) => (
                  <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                    {children}
                  </ul>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,

                // --- CODE HANDLING ---
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeString = String(children).replace(/\n$/, "");
                  const isInline = !match && !codeString.includes("\n");

                  if (isInline) {
                    return (
                      <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="my-5">
                      <CodeBlock
                        language={language}
                        theme={resolvedTheme === "light" ? "light" : "dark"}
                      >
                        {codeString}
                      </CodeBlock>
                    </div>
                  );
                },
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm mx-4 rounded-[12px] border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3
              className={cn(
                "text-[18px] text-neutral-900 dark:text-neutral-100",
                dmSerif.className,
              )}
            >
              Delete note?
            </h3>
            <p className="mt-1.5 text-[14px] text-neutral-500 dark:text-neutral-400">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-[7px] border border-neutral-200 text-[14px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-[7px] bg-red-50 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "amber" | "red" | "neutral";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    neutral:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 text-[11.5px] font-medium uppercase tracking-wider rounded-full",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

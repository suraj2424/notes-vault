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
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0f0f0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-400 dark:border-[#2a2a2a] dark:border-t-[#555555]" />
      </div>
    );
  }

  if (!note) return null;

  // Get unique languages from implementations
  const languages = note.type === "dsa" && note.dsa
    ? [...new Set(note.dsa.implementations.map((i) => i.language))]
    : [];
  const activeImplementation = note.type === "dsa" && note.dsa
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
                "text-xl tracking-tight text-neutral-900 dark:text-neutral-100",
                dmSerif.className,
              )}
            >
              {note.title}
            </h1>
            <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-500">
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
            <Star className={cn("h-4 w-4", note.isFavorite && "fill-amber-500")} />
          </button>
          <Link
            href={`/dashboard/notes/${note.id}/edit`}
            className="flex items-center gap-1.5 rounded-[7px] border border-neutral-200 px-3 h-8 text-[12.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 rounded-[7px] border border-neutral-200 px-3 h-8 text-[12.5px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:border-red-200 dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:border-red-900"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
              <span
                className={cn(
                  "px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider rounded-full",
                  note.dsa.difficulty === "Easy"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : note.dsa.difficulty === "Medium"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                )}
              >
                {note.dsa.difficulty}
              </span>
              <Badge variant="blue">{note.dsa.platform}</Badge>
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
            <Tag className="h-3.5 w-3.5 text-neutral-400 dark:text-[#555555]" />
            {note.tags.map((tag) => (
              <Link
                key={tag}
                href={`/dashboard/notes?search=${encodeURIComponent(tag)}`}
                className="text-[11.5px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-0.5 rounded-full transition-colors dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
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
         <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#161616]">
            <div className="markdown-content max-w-none text-[13px]">
              <ReactMarkdown
                   components={{
                     code: ({ node, className, children, ...props }) => {
                       const match = /language-(\w+)/.exec(className || "");
                       const language = match ? match[1] : "";
                       const codeString = String(children).replace(/\n$/, "");
                       const isInline = !match && !codeString.includes("\n");

                       if (isInline) {
                         return (
                           <code className={className} {...props}>
                             {children}
                           </code>
                         );
                       }

                       return (
                         <CodeBlock
                           language={language}
                           theme={resolvedTheme === "light" ? "light" : "dark"}
                         >
                           {codeString}
                         </CodeBlock>
                       );
                     },
                   }}
                 >
                   {note.dsa.problemStatement}
                 </ReactMarkdown>
               </div>
            </div>
          )}

          {/* Complexity - Two Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] border border-neutral-200 bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#161616]">
              <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-[#555555]">
                Time Complexity
              </p>
              <p className="font-mono text-[13px] text-neutral-900 dark:text-[#ededed]">
                {note.dsa.timeComplexity || "O(1)"}
              </p>
            </div>
            <div className="rounded-[10px] border border-neutral-200 bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#161616]">
              <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-[#555555]">
                Space Complexity
              </p>
              <p className="font-mono text-[13px] text-neutral-900 dark:text-[#ededed]">
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
                      "flex items-center gap-1.5 px-3 h-8 text-[12.5px] font-medium rounded-[7px] border transition-colors",
                      activeLang === idx
                        ? "border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    {lang}
                  </button>
                ))}
              </div>

               {/* Code Editor */}
               {activeImplementation && (
                 <CodeBlock language={activeImplementation.language} theme={resolvedTheme === "light" ? "light" : "dark"}>
                   {activeImplementation.code}
                 </CodeBlock>
               )}
            </div>
          )}

          {/* Notes / Key Takeaways */}
          {note.dsa.notes && (
            <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#161616]">
              <h3 className="mb-3 text-[13px] font-medium text-neutral-900 dark:text-[#ededed]">
                Notes
              </h3>
                <div className="prose prose-sm prose-neutral max-w-none text-[13px] text-neutral-600 dark:text-[#888888]">
                  <ReactMarkdown
                    components={{
                      code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const codeString = String(children).replace(/\n$/, "");
                        const isInline = !match && !codeString.includes("\n");

                        if (isInline) {
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
                        );
                      },
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
        <div className="space-y-5">
          {note.qa.content && (
             <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#161616]">
                <div className="markdown-content max-w-none text-[13px]">
                  <ReactMarkdown
                    components={{
                      code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const codeString = String(children).replace(/\n$/, "");
                        const isInline = !match && !codeString.includes("\n");

                        if (isInline) {
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {note.qa.content}
                  </ReactMarkdown>
                </div>
              </div>
          )}

          {note.qa.importantPoints && note.qa.importantPoints.filter((p) => p.trim()).length > 0 && (
            <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#161616]">
              <h3 className="mb-3 text-[13px] font-medium text-neutral-900 dark:text-[#ededed]">
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {note.qa.importantPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13px] text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
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
        <div className="rounded-[10px] border border-neutral-200 bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#161616]">
                <div className="markdown-content max-w-none text-[13px]">
                  <ReactMarkdown
               components={{
                 code: ({ node, className, children, ...props }) => {
                   const match = /language-(\w+)/.exec(className || "");
                   const language = match ? match[1] : "";
                   const codeString = String(children).replace(/\n$/, "");
                   const isInline = !match && !codeString.includes("\n");

                   if (isInline) {
                     return (
                       <code className={className} {...props}>
                         {children}
                       </code>
                     );
                   }

                        return (
                          <CodeBlock
                            language={language}
                            theme={resolvedTheme === "light" ? "light" : "dark"}
                          >
                            {codeString}
                          </CodeBlock>
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
            className="w-full max-w-sm mx-4 rounded-[12px] border border-neutral-200 bg-white p-6 shadow-xl dark:border-[#2a2a2a] dark:bg-[#161616]"
          >
            <h3
              className={cn(
                "text-[17px] text-neutral-900 dark:text-[#ededed]",
                dmSerif.className,
              )}
            >
              Delete note?
            </h3>
            <p className="mt-1.5 text-[13px] text-neutral-500 dark:text-[#555555]">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-9 rounded-[7px] border border-neutral-200 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-[#2a2a2a] dark:text-[#888888] dark:hover:bg-[#1e1e1e] dark:hover:text-[#ededed]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-9 rounded-[7px] bg-red-50 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-950 dark:hover:border-red-900"
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
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider rounded-full",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Note, NoteType } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Code2,
  BookOpen,
  FileText,
  Star,
  ArrowUpDown,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title A-Z" },
] as const;

interface User {
  name: string;
  email: string;
}

interface NotesLibraryClientProps {
  user: User | null;
  initialNotes: Note[];
  totalPages: number;
  currentPage: number;
}

function NoteCard({
  note,
  onToggleFavorite,
}: {
  note: Note;
  onToggleFavorite: (noteId: string, currentFavorite: boolean) => Promise<void>;
}) {
  return (
    // Fixed: Standardized border-neutral-200 and dark:border-neutral-800
    <div className="group relative flex h-full flex-col rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600 shadow-sm">
      <div className="flex flex-col h-full p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800",
              note.type === "dsa"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : note.type === "qa"
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400",
            )}
          >
            {note.type === "dsa" ? (
              <Code2 className="h-5 w-5" />
            ) : note.type === "qa" ? (
              <BookOpen className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/notes/${note.id}`}>
              <h3 className="text-[15px] font-bold leading-snug text-neutral-950 transition-colors group-hover:text-neutral-700 dark:text-neutral-50 dark:group-hover:text-neutral-300">
                {note.title}
              </h3>
            </Link>
          </div>
        </div>

        {note.type === "dsa" && note.dsa && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                note.dsa.difficulty === "Easy"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : note.dsa.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
              )}
            >
              {note.dsa.difficulty}
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {note.dsa.platform}
            </span>
          </div>
        )}

        {note.type === "qa" && note.qa && note.qa.content && (
          <p className="mt-3 line-clamp-2 text-[13px] font-medium italic text-neutral-500 dark:text-neutral-400 leading-relaxed">
            &ldquo;{note.qa.content.replace(/[#*`]/g, "").split("\n")[0]}&rdquo;
          </p>
        )}

        {note.type === "general" && note.content && (
          <p className="mt-3 line-clamp-2 text-[13px] font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {note.content.replace(/[#*`]/g, "")}
          </p>
        )}

        <div className="flex-1 mt-4" />
        <div className="border-t border-neutral-100 dark:border-neutral-900" />
        <div className="flex items-center justify-between pt-3 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="text-neutral-950 dark:text-neutral-300">
              {note.type}
            </span>
            <span className="opacity-50">•</span>
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onToggleFavorite(note.id, note.isFavorite);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              note.isFavorite
                ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                : "text-neutral-300 hover:text-amber-500 hover:bg-amber-50 dark:text-neutral-700 dark:hover:bg-amber-500/10",
            )}
          >
            <Star
              className={cn("h-4 w-4", note.isFavorite && "fill-amber-500")}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesLibraryClient({
  user,
  initialNotes,
  totalPages,
  currentPage,
}: NotesLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">(
    (searchParams.get("type") as any) || "all",
  );
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    searchParams.get("filter") === "favorites",
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);

  // Sync URL params to local state on mount and URL changes
  useEffect(() => {
    const params = searchParams;
    const search = params.get("search");
    const type = params.get("type") as NoteType | null;
    const filter = params.get("filter");

    if (search) setSearchQuery(search); // eslint-disable-line react-hooks/set-state-in-effect
    if (type && ["dsa", "qa", "general"].includes(type)) setTypeFilter(type);
    if (filter) setShowFavoritesOnly(filter === "favorites");
  }, [searchParams]);

  const updateURL = useCallback(
    (
      newPage?: number,
      newSearch?: string,
      newType?: string,
      newFilter?: string,
    ) => {
      const params = new URLSearchParams();
      params.set("page", (newPage ?? page).toString());
      if (newSearch !== undefined || searchQuery) {
        params.set("search", newSearch ?? searchQuery);
      }
      if (newType !== undefined || typeFilter !== "all") {
        params.set("type", newType ?? typeFilter);
      }
      if (newFilter !== undefined || showFavoritesOnly) {
        params.set("filter", "favorites");
      }
      const query = params.toString();
      router.push(`/dashboard/notes?${query}`);
    },
    [page, searchQuery, typeFilter, showFavoritesOnly, router],
  );

  const fetchNotes = useCallback(
    async (
      pageNum: number,
      search: string,
      type: NoteType | "all",
      favOnly: boolean,
    ) => {
      let url = "/api/notes?";
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("pageSize", "20");
      params.append(
        "fields",
        "id,userId,type,title,isFavorite,tags,createdAt,updatedAt",
      );

      if (type !== "all") params.append("type", type);
      if (favOnly) params.append("favorite", "true");
      if (search) params.append("search", search);

      url += params.toString();

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          let fetchedNotes = data.notes as Note[];

          fetchedNotes.sort((a, b) => {
            if (sortBy === "recent")
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            if (sortBy === "oldest")
              return (
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
              );
            if (sortBy === "title") return a.title.localeCompare(b.title);
            return 0;
          });

          setNotes(fetchedNotes);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    },
    [sortBy],
  );

  const handleToggleFavorite = useCallback(
    async (noteId: string, currentFavorite: boolean) => {
      const newFavorite = !currentFavorite;

      // Optimistic update
      setNotes((prevNotes) => {
        if (showFavoritesOnly && !newFavorite) {
          return prevNotes.filter((note) => note.id !== noteId);
        } else {
          return prevNotes.map((note) =>
            note.id === noteId ? { ...note, isFavorite: newFavorite } : note,
          );
        }
      });

      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newFavorite }),
        });

        if (!response.ok) {
          throw new Error("Failed to update");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // Rollback: refetch current page
        fetchNotes(page, searchQuery, typeFilter, showFavoritesOnly);
      }
    },
    [showFavoritesOnly, page, searchQuery, typeFilter, fetchNotes],
  );

  const handleTypeFilterChange = (newType: NoteType | "all") => {
    startTransition(() => {
      setTypeFilter(newType);
      setPage(1);
      updateURL(
        1,
        searchQuery,
        newType,
        showFavoritesOnly ? "favorites" : undefined,
      );
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
  };

  const handleFavoritesToggle = () => {
    const newState = !showFavoritesOnly;
    setShowFavoritesOnly(newState);
    startTransition(() => {
      setPage(1);
      updateURL(1, searchQuery, typeFilter, newState ? "favorites" : undefined);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(() => {
      updateURL(
        newPage,
        searchQuery,
        typeFilter,
        showFavoritesOnly ? "favorites" : undefined,
      );
    });
  };

  // Fetch notes when page/sort/filters change
  useEffect(() => {
    fetchNotes(page, searchQuery, typeFilter, showFavoritesOnly); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, typeFilter, showFavoritesOnly, sortBy, fetchNotes, searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (searchParams.get("search") || "")) {
        startTransition(() => {
          setPage(1);
          updateURL(
            1,
            searchQuery,
            typeFilter,
            showFavoritesOnly ? "favorites" : undefined,
          );
          fetchNotes(1, searchQuery, typeFilter, showFavoritesOnly);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    fetchNotes,
    typeFilter,
    showFavoritesOnly,
    searchParams,
    updateURL,
  ]);

  if (!user) {
    return null;
  }

  if (!user) return null;

  return (
    <div className={cn(dmSans.className, "max-w-7xl mx-auto")}>
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end border-b border-neutral-200 pb-8 dark:border-neutral-800">
        <div>
          <h1
            className={cn(
              "text-[32px] tracking-tight text-neutral-950 dark:text-neutral-50 leading-none",
              dmSerif.className,
            )}
          >
            Notes Library
          </h1>
          <p className="mt-3 text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Manage and organize your personal vault.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-[13px] font-medium outline-none transition-all focus:border-neutral-400 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600 dark:text-neutral-100"
            />
          </div>
          <Link
            href="/dashboard/notes/new"
            className="flex items-center gap-2 h-10 rounded-xl bg-neutral-950 px-5 text-[14px] font-bold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-white active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            New
          </Link>
        </div>
      </header>

      {/* Filters Bar - Fixed Border Contrast */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
            <Filter className="h-4 w-4" />
          </div>
          {(["all", "dsa", "qa", "general"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setPage(1);
              }}
              className={cn(
                "rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all",
                typeFilter === t
                  ? "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950"
                  : "bg-neutral-50 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
              )}
            >
              {t}
            </button>
          ))}
          <div className="mx-2 h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all",
              showFavoritesOnly
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400",
            )}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                showFavoritesOnly && "fill-amber-500",
              )}
            />
            Favorites
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-[12.5px] font-bold text-neutral-800 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            <ArrowUpDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform text-neutral-400",
                showSortDropdown && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-2xl"
                >
                  <div className="p-1.5">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2.5 text-left text-[13px] rounded-lg transition-colors",
                          sortBy === option.value
                            ? "bg-neutral-100 font-bold text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50"
                            : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900/50 hover:text-neutral-950 dark:hover:text-neutral-50",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notes Grid */}
      {isPending || (notes.length === 0 && totalPagesState > 0) ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
            />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <NoteCard note={note} onToggleFavorite={handleToggleFavorite} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-950/30">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
            <Search className="h-8 w-8" />
          </div>
          <h3
            className={cn(
              "text-xl text-neutral-950 dark:text-neutral-50",
              dmSerif.className,
            )}
          >
            No notes found
          </h3>
          <p className="mt-2 max-w-[320px] text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Try adjusting your search terms or clearing your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setShowFavoritesOnly(false);
              setPage(1);
              router.push("/dashboard/notes");
            }}
            className="mt-8 rounded-xl bg-neutral-950 px-6 py-2 text-[13px] font-bold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-white"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPagesState > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex h-10 items-center gap-1 rounded-xl px-4 text-[13px] font-bold text-neutral-700 border border-neutral-200 transition-all hover:bg-neutral-50 disabled:opacity-30 dark:text-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPagesState) }, (_, i) => {
              let pageNum;
              if (totalPagesState <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPagesState - 2)
                pageNum = totalPagesState - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold transition-all",
                    page === pageNum
                      ? "bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 shadow-md"
                      : "text-neutral-500 border border-neutral-200 hover:bg-neutral-50 dark:text-neutral-400 dark:border-neutral-800 dark:hover:bg-neutral-900",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPagesState}
            className="flex h-10 items-center gap-1 rounded-xl px-4 text-[13px] font-bold text-neutral-700 border border-neutral-200 transition-all hover:bg-neutral-50 disabled:opacity-30 dark:text-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

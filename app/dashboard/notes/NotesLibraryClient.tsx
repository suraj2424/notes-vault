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

const NOTE_TYPE_STYLES: Record<
  NoteType,
  { iconWrap: string; typeBadge: string; accentBorder: string; filterChip: string; filterChipActive: string }
> = {
  dsa: {
    iconWrap: "bg-[#00A3A3]/5 text-[#00A3A3] border-[#00A3A3]/10 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:border-[#00E0E0]/10",
    typeBadge: "bg-[#00A3A3]/5 text-[#00A3A3] border-[#00A3A3]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:border-[#00E0E0]/20",
    accentBorder: "hover:border-[#00A3A3]/40 dark:hover:border-[#00E0E0]/30 group-hover:shadow-[0_0_0_1px_rgba(0,163,163,0.05)]",
    filterChip: "bg-[#00A3A3]/5 text-[#00A3A3] border-[#00A3A3]/20 hover:bg-[#00A3A3]/10 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:border-[#00E0E0]/20 dark:hover:bg-[#00E0E0]/10",
    filterChipActive: "bg-[#00A3A3] text-white border-[#00A3A3] dark:bg-[#00E0E0] dark:text-[#111111] dark:border-[#00E0E0]",
  },
  qa: {
    iconWrap: "bg-amber-500/5 text-amber-600 border-amber-500/10 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10",
    typeBadge: "bg-amber-500/5 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    accentBorder: "hover:border-amber-500/40 dark:hover:border-amber-500/30 group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.05)]",
    filterChip: "bg-amber-500/5 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/10",
    filterChipActive: "bg-amber-500 text-white border-amber-500 dark:bg-amber-400 dark:text-[#111111] dark:border-amber-400",
  },
  general: {
    iconWrap: "bg-[#687076]/5 text-[#1A1D1E] border-[#E6E8EB] dark:bg-[#A0A0A0]/5 dark:text-[#E4E6EB] dark:border-[#2D2D2D]",
    typeBadge: "bg-[#687076]/5 text-[#687076] border-[#E6E8EB] dark:bg-[#A0A0A0]/10 dark:text-[#A0A0A0] dark:border-[#2D2D2D]",
    accentBorder: "hover:border-[#687076]/40 dark:hover:border-[#A0A0A0]/30",
    filterChip: "bg-[#F4F7F6] text-[#687076] border-[#E6E8EB] hover:bg-[#E6E8EB] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:border-[#2D2D2D] dark:hover:bg-[#2D2D2D]",
    filterChipActive: "bg-[#1A1D1E] text-white border-[#1A1D1E] dark:bg-[#E4E6EB] dark:text-[#111111] dark:border-[#E4E6EB]",
  },
};

export function NoteCard({
  note,
  onToggleFavorite,
}: {
  note: Note;
  onToggleFavorite: (noteId: string, currentFavorite: boolean) => Promise<void>;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:bg-[#1A1A1A] transition-colors duration-100 dark:border-[#2D2D2D]",
        NOTE_TYPE_STYLES[note.type].accentBorder,
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Card Header Info */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border",
              NOTE_TYPE_STYLES[note.type].iconWrap,
            )}
          >
            {note.type === "dsa" ? (
              <Code2 className="h-4 w-4" />
            ) : note.type === "qa" ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <Link href={`/dashboard/notes/${note.id}`}>
              <h3 className="text-sm font-bold leading-snug text-[#1A1D1E] transition-colors duration-100 group-hover:text-[#687076] dark:text-[#E4E6EB] dark:group-hover:text-[#A0A0A0]">
                {note.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* DSA Details Meta Badges */}
        {note.type === "dsa" && note.dsa && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                note.dsa.difficulty === "Easy"
                  ? "bg-green-100/50 text-green-700 border-green-200/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                  : note.dsa.difficulty === "Medium"
                    ? "bg-yellow-100/50 text-yellow-700 border-yellow-200/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
                    : "bg-red-100/50 text-red-700 border-red-200/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
              )}
            >
              {note.dsa.difficulty}
            </span>
            <span className="rounded bg-[#F4F7F6] border border-[#E6E8EB] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:bg-[#111111] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
              {note.dsa.platform}
            </span>
            {!!note.dsa.pattern && (
              <span className="rounded bg-[#00A3A3]/5 border border-[#00A3A3]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00A3A3] dark:bg-[#00E0E0]/5 dark:border-[#00E0E0]/10 dark:text-[#00E0E0]">
                {note.dsa.pattern}
              </span>
            )}
          </div>
        )}

        {/* Universal Note Tags Section */}
        {!!note.tags?.length && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {note.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-[#FFFFFF] border border-[#E6E8EB] px-1.5 py-0.5 text-[10px] font-bold text-[#687076] dark:bg-[#111111] dark:border-[#2D2D2D] dark:text-[#A0A0A0]"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 4 && (
              <span className="rounded bg-[#F4F7F6] border border-[#E6E8EB] px-1.5 py-0.5 text-[10px] font-bold text-[#687076] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
                +{note.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Content Previews */}
        {note.type === "qa" && note.qa && note.qa.content && (
          <p className="mt-2.5 line-clamp-2 text-xs font-medium italic text-[#687076] dark:text-[#A0A0A0] leading-relaxed">
            &ldquo;{note.qa.content.replace(/[#*`]/g, "").split("\n")[0]}&rdquo;
          </p>
        )}

        {note.type === "general" && note.content && (
          <p className="mt-2.5 line-clamp-2 text-xs font-medium text-[#687076] dark:text-[#A0A0A0] leading-relaxed">
            {note.content.replace(/[#*`]/g, "")}
          </p>
        )}

        {/* Structural spacer anchoring alignment down card height */}
        <div className="flex-1 mt-3.5" />
        <div className="border-t border-[#E6E8EB] dark:border-[#2D2D2D]" />
        
        {/* Footer Area */}
        <div className="flex items-center justify-between pt-2.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                NOTE_TYPE_STYLES[note.type].typeBadge,
              )}
            >
              {note.type === 'qa' ? 'Q&A' : note.type}
            </span>
            <span className="text-[#E6E8EB] dark:text-[#2D2D2D] font-normal">•</span>
            <span className="text-[11px] font-medium text-[#687076] dark:text-[#A0A0A0] normal-case tracking-normal">
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
              "flex h-7 w-7 items-center justify-center rounded border transition-colors duration-100",
              note.isFavorite
                ? "text-amber-500 bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/30"
                : "text-[#687076]/40 border-[#E6E8EB] hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/20 dark:border-[#2D2D2D] dark:text-[#A0A0A0]/40 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/30",
            )}
          >
            <Star
              className={cn("h-3.5 w-3.5", note.isFavorite && "fill-amber-500")}
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
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
    const search = params.get("search") || "";
    const type = params.get("type") as NoteType | null;
    const filter = params.get("filter");

    setSearchQuery(search);
    setDebouncedSearchQuery(search);
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
    [page, debouncedSearchQuery, typeFilter, showFavoritesOnly, router],
  );

  const fetchNotes = useCallback(
    async (
      pageNum: number,
      search: string,
      type: NoteType | "all",
      favOnly: boolean,
      sort: "recent" | "oldest" | "title" = "recent",
    ) => {
      let url = "/api/notes?";
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("pageSize", "20");
      params.append(
        "fields",
        "id,userId,type,title,isFavorite,tags,createdAt,updatedAt",
      );
      params.append("sort", sort);

      if (type !== "all") params.append("type", type);
      if (favOnly) params.append("favorite", "true");
      if (search) params.append("search", search);

      url += params.toString();

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes as Note[]);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    },
    [],
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
        fetchNotes(page, debouncedSearchQuery, typeFilter, showFavoritesOnly, sortBy);
      }
    },
    [showFavoritesOnly, page, debouncedSearchQuery, typeFilter, sortBy, fetchNotes],
  );

  const handleTypeFilterChange = (newType: NoteType | "all") => {
    startTransition(() => {
      setTypeFilter(newType);
      setPage(1);
      updateURL(
        1,
        debouncedSearchQuery,
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
      updateURL(1, debouncedSearchQuery, typeFilter, newState ? "favorites" : undefined);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(() => {
      updateURL(
        newPage,
        debouncedSearchQuery,
        typeFilter,
        showFavoritesOnly ? "favorites" : undefined,
      );
    });
  };

  // Fetch notes when page/sort/filters change
  useEffect(() => {
    fetchNotes(page, debouncedSearchQuery, typeFilter, showFavoritesOnly, sortBy);
  }, [page, typeFilter, showFavoritesOnly, sortBy, debouncedSearchQuery, fetchNotes]);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get("search") || "")) {
      startTransition(() => {
        setPage(1);
        updateURL(
          1,
          debouncedSearchQuery,
          typeFilter,
          showFavoritesOnly ? "favorites" : undefined,
        );
      });
    }
  }, [debouncedSearchQuery, searchParams, typeFilter, showFavoritesOnly, updateURL]);

  if (!user) {
    return null;
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl">
  {/* Header Section */}
  <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] leading-none">
        Notes Library
      </h1>
      <p className="mt-2 text-xs font-medium text-[#687076] dark:text-[#A0A0A0]">
        Manage and organize your personal vault.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="relative flex-1 sm:w-64 group">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#687076]/60 dark:text-[#A0A0A0]/50 pointer-events-none transition-colors group-focus-within:text-[#1A1D1E] dark:group-focus-within:text-[#E4E6EB]" />
        <input
          type="text"
          placeholder="Search vault..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "h-9 w-full rounded border pl-9 pr-3 text-xs font-medium outline-none transition-colors duration-100",
            "bg-[#F4F7F6] border-[#E6E8EB] text-[#1A1D1E] placeholder:text-[#687076]/50",
            "focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
            "dark:bg-[#111111] dark:border-[#2D2D2D] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40",
            "dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A]",
          )}
        />
      </div>
    </div>
  </header>

  {/* Filters Bar Container */}
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-3 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0]">
        <Filter className="h-3.5 w-3.5" />
      </div>
      
      {/* Type Filter Chips */}
      {(["all", "dsa", "qa", "general"] as const).map((t) => (
        <button
          key={t}
          onClick={() => {
            setTypeFilter(t);
            setPage(1);
          }}
          className={cn(
            "rounded px-3 h-7 text-[10px] font-bold uppercase tracking-wide transition-colors border duration-100",
            t === "all"
              ? typeFilter === "all"
                ? "bg-[#1A1D1E] text-white border-[#1A1D1E] dark:bg-[#E4E6EB] dark:text-[#111111] dark:border-[#E4E6EB]"
                : "bg-[#F4F7F6] text-[#687076] border-[#E6E8EB] hover:bg-[#E6E8EB] dark:bg-[#111111] dark:text-[#A0A0A0] dark:border-[#2D2D2D] dark:hover:bg-[#2D2D2D]"
              : typeFilter === t
                ? cn(
                    NOTE_TYPE_STYLES[t].filterChipActive,
                  )
                : NOTE_TYPE_STYLES[t].filterChip,
          )}
        >
          {t === 'qa' ? 'Q&A' : t}
        </button>
      ))}
      
      <div className="mx-1 h-4 w-px bg-[#E6E8EB] dark:bg-[#2D2D2D]" />
      
      {/* Favorites Toggle */}
      <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={cn(
          "flex items-center gap-1.5 rounded px-3 h-7 text-[10px] font-bold uppercase tracking-wide transition-colors border duration-100",
          showFavoritesOnly
            ? "bg-amber-500/5 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
            : "bg-[#FFFFFF] text-[#687076] border-[#E6E8EB] hover:bg-[#F4F7F6] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:border-[#2D2D2D] dark:hover:bg-[#111111]",
        )}
      >
        <Star
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-100",
            showFavoritesOnly ? "fill-amber-500 text-amber-500" : "text-[#687076]/60 dark:text-[#A0A0A0]/50",
          )}
        />
        Favorites
      </button>
    </div>

    {/* Sort Dropdown Component */}
    <div className="relative">
      <button
        onClick={() => setShowSortDropdown(!showSortDropdown)}
        className="flex h-7 items-center gap-1.5 rounded border border-[#E6E8EB] bg-[#FFFFFF] px-2.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-[#111111]"
      >
        <ArrowUpDown className="h-3 w-3 text-[#687076]/60 dark:text-[#A0A0A0]/50" />
        <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-100 text-[#687076]/60 dark:text-[#A0A0A0]/50",
            showSortDropdown && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {showSortDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.08 }}
              className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A]"
            >
              <div className="p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "w-full px-2 py-1.5 text-left text-xs font-medium rounded transition-colors duration-100",
                      sortBy === option.value
                        ? "bg-[#F4F7F6] font-bold text-[#1A1D1E] dark:bg-[#111111] dark:text-[#E4E6EB]"
                        : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50 hover:text-[#1A1D1E] dark:hover:text-[#E4E6EB]",
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

  {/* Notes Grid Base Blocks */}
  {isPending || (notes.length === 0 && totalPagesState > 0) ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-lg bg-[#F4F7F6] border border-[#E6E8EB] dark:bg-[#111111]/50 dark:border-[#2D2D2D]"
        />
      ))}
    </div>
  ) : notes.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.015, duration: 0.1 }}
          >
            <NoteCard note={note} onToggleFavorite={handleToggleFavorite} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  ) : (
    /* Empty State Container */
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E6E8EB] bg-[#F4F7F6]/30 py-20 text-center dark:border-[#2D2D2D] dark:bg-[#111111]/10">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-[#1A1D1E] dark:text-[#E4E6EB]">
        No notes found
      </h3>
      <p className="mt-1 max-w-[280px] text-xs font-medium text-[#687076] dark:text-[#A0A0A0]">
        Try adjusting your search terms or clearing your filters.
      </p>
      <button
        onClick={() => {
          setSearchQuery("");
          setDebouncedSearchQuery("");
          setTypeFilter("all");
          setShowFavoritesOnly(false);
          setPage(1);
          router.push("/dashboard/notes");
        }}
        className="mt-6 rounded h-8 px-4 bg-[#1A1D1E] text-xs font-bold text-white transition-colors duration-100 hover:bg-[#687076] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#A0A0A0]"
      >
        Clear all filters
      </button>
    </div>
  )}

  {/* Pagination Navigation Elements */}
  {totalPagesState > 1 && (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="flex h-8 items-center gap-1 rounded px-3 text-xs font-bold text-[#687076] border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] disabled:opacity-30 dark:text-[#A0A0A0] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: Math.min(5, totalPagesState) }, (_, i) => {
          let pageNum;
          if (totalPagesState <= 5) pageNum = i + 1;
          else if (page <= 3) pageNum = i + 1;
          else if (page >= totalPagesState - 2) pageNum = totalPagesState - 4 + i;
          else pageNum = page - 2 + i;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-colors duration-100 border",
                page === pageNum
                  ? "bg-[#1A1D1E] text-white border-[#1A1D1E] dark:bg-[#E4E6EB] dark:text-[#111111] dark:border-[#E4E6EB]"
                  : "text-[#687076] bg-[#FFFFFF] border-[#E6E8EB] hover:bg-[#F4F7F6] dark:text-[#A0A0A0] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:hover:bg-[#111111]",
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
        className="flex h-8 items-center gap-1 rounded px-3 text-xs font-bold text-[#687076] border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] disabled:opacity-30 dark:text-[#A0A0A0] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )}
</div>
  );
}

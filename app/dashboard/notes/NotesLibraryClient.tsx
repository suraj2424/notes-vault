"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Filter,
  Plus,
  Search,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Note, NoteType } from "@/types";

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title A-Z" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];
type TypeFilter = NoteType | "all";

interface User {
  name: string;
  email: string;
}

interface NotesLibraryClientProps {
  user: User | null;
  initialNotes: Note[];
  totalPages: number;
  currentPage: number;
  initialTag?: string;
}

const NOTE_TYPE_STYLES: Record<
  NoteType,
  {
    label: string;
    icon: LucideIcon;
    iconWrap: string;
    typeBadge: string;
    accentBorder: string;
    filterChip: string;
    filterChipActive: string;
  }
> = {
  dsa: {
    label: "DSA",
    icon: Code2,
    iconWrap:
      "border-[#00A3A3]/15 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/15 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]",
    typeBadge:
      "border-[#00A3A3]/20 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]",
    accentBorder: "hover:border-[#00A3A3]/40 dark:hover:border-[#00E0E0]/30",
    filterChip:
      "border-[#00A3A3]/20 bg-[#00A3A3]/5 text-[#00A3A3] hover:bg-[#00A3A3]/10 dark:border-[#00E0E0]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:hover:bg-[#00E0E0]/10",
    filterChipActive:
      "border-[#00A3A3] bg-[#00A3A3] text-white dark:border-[#00E0E0] dark:bg-[#00E0E0] dark:text-[#111111]",
  },
  qa: {
    label: "Q&A",
    icon: BookOpen,
    iconWrap:
      "border-amber-500/15 bg-amber-500/5 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/5 dark:text-amber-400",
    typeBadge:
      "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
    accentBorder: "hover:border-amber-500/40 dark:hover:border-amber-500/30",
    filterChip:
      "border-amber-500/20 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:hover:bg-amber-500/10",
    filterChipActive:
      "border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-[#111111]",
  },
  general: {
    label: "General",
    icon: FileText,
    iconWrap:
      "border-default bg-bg-muted text-primary dark:bg-[#A0A0A0]/5",
    typeBadge:
      "border-default bg-bg-muted text-secondary dark:bg-[#A0A0A0]/10",
    accentBorder: "hover:border-[#687076]/40 dark:hover:border-[#A0A0A0]/30",
    filterChip:
      "border-default bg-bg-muted text-secondary hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D]",
    filterChipActive:
      "border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]",
  },
};

const DIFFICULTY_STYLES = {
  Easy: "border-green-200/60 bg-green-100/70 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400",
  Medium:
    "border-yellow-200/70 bg-yellow-100/70 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400",
  Hard: "border-red-200/60 bg-red-100/70 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
} as const;

function stripMarkdown(content: string) {
  return content.replace(/[#*_`>[\]()]/g, "").replace(/\s+/g, " ").trim();
}

function getNotePreview(note: Note) {
  if (note.type === "qa") return stripMarkdown(note.qa?.content || "");
  if (note.type === "dsa") return stripMarkdown(note.dsa?.problemStatement || note.dsa?.notes || "");
  return stripMarkdown(note.content || "");
}

function TypeIcon({ type }: { type: NoteType }) {
  const meta = NOTE_TYPE_STYLES[type];
  const Icon = meta.icon;

  return (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", meta.iconWrap)}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function TypeBadge({ type }: { type: NoteType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        NOTE_TYPE_STYLES[type].typeBadge
      )}
    >
      {NOTE_TYPE_STYLES[type].label}
    </span>
  );
}

export function NoteCard({
  note,
  onToggleFavorite,
}: {
  note: Note;
  onToggleFavorite: (noteId: string, currentFavorite: boolean) => Promise<void>;
}) {
  const preview = getNotePreview(note);

  return (
    <Link
      href={`/dashboard/notes/${note.id}`}
      className={cn(
      "group relative flex h-full min-h-44 flex-col overflow-hidden rounded-lg border border-default bg-surface transition-colors duration-100",
        NOTE_TYPE_STYLES[note.type].accentBorder
      )}
    >
      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-start gap-3">
          <TypeIcon type={note.type} />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-primary transition-colors duration-100 group-hover:text-secondary">
              {note.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onToggleFavorite(note.id, note.isFavorite);
            }}
            className={cn(
              "relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-100",
              note.isFavorite
                ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                : "border-default bg-surface text-secondary/60 hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500"
            )}
            aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-3.5 w-3.5", note.isFavorite && "fill-amber-500")} />
          </button>
        </div>

        <div className="mt-3 overflow-hidden">
          {note.type === "dsa" && note.dsa ? (
            <div className="flex max-h-6 flex-wrap gap-1.5 overflow-hidden">
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                DIFFICULTY_STYLES[note.dsa.difficulty]
              )}
            >
              {note.dsa.difficulty}
            </span>
            {!!note.dsa.platform && (
              <span className="rounded border border-default bg-bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                {note.dsa.platform}
              </span>
            )}
            {!!note.dsa.pattern && (
              <span className="rounded border border-[#00A3A3]/10 bg-[#00A3A3]/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00A3A3] dark:border-[#00E0E0]/10 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]">
                {note.dsa.pattern}
              </span>
            )}
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          {preview && (
          <p className="line-clamp-2 text-xs font-medium leading-6 text-secondary">
            {note.type === "qa" ? `"${preview}"` : preview}
          </p>
          )}
        </div>

        <div className="mt-3 overflow-hidden">
          {!!note.tags?.length && (
          <div className="flex max-h-6 flex-wrap gap-1.5 overflow-hidden">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded border border-default bg-surface px-1.5 py-0.5 text-[10px] font-bold text-secondary"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="rounded border border-default bg-bg-muted px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-3 border-t border-default pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <TypeBadge type={note.type} />
              <span className="truncate text-[11px] font-medium text-secondary">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-secondary transition-colors duration-100 group-hover:text-primary">
              Open
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FilterChip({
  active,
  children,
  className,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100",
        className,
        active && "shadow-sm"
      )}
    >
      {children}
    </button>
  );
}

function SortMenu({
  sortBy,
  open,
  onOpenChange,
  onSortChange,
}: {
  sortBy: SortValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSortChange: (sort: SortValue) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-default bg-surface px-3 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-100", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-default bg-surface shadow-sm">
            <div className="p-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSortChange(option.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full rounded px-2 py-2 text-left text-xs font-medium transition-colors duration-100",
                    sortBy === option.value
                      ? "bg-bg-muted font-bold text-primary"
                      : "text-secondary hover:bg-bg-muted hover:text-primary"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-52 rounded-lg border border-default bg-surface dark:bg-[#161616]"
        />
      ))}
    </div>
  );
}

export function NotesLibraryClient({
  user,
  initialNotes,
  totalPages,
  currentPage,
  initialTag,
}: NotesLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    (searchParams.get("type") as TypeFilter) || "all"
  );
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    searchParams.get("filter") === "favorites"
  );
  const [tagFilter, setTagFilter] = useState(searchParams.get("tag") || initialTag || "");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as NoteType | null;
    const filter = searchParams.get("filter");
    const tag = searchParams.get("tag") || "";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(search);
    setDebouncedSearchQuery(search);
    setTypeFilter(type && ["dsa", "qa", "general"].includes(type) ? type : "all");
    setShowFavoritesOnly(filter === "favorites");
    setTagFilter(tag);
  }, [searchParams]);

  const updateURL = useCallback(
    (newPage?: number, newSearch?: string, newType?: TypeFilter, newFilter?: string, newTag?: string) => {
      const params = new URLSearchParams();
      params.set("page", (newPage ?? page).toString());

      const search = newSearch ?? searchQuery;
      const type = newType ?? typeFilter;
      const tag = newTag ?? tagFilter;

      if (search) params.set("search", search);
      if (type !== "all") params.set("type", type);
      if (newFilter !== undefined || showFavoritesOnly) params.set("filter", "favorites");
      if (tag) params.set("tag", tag);

      const query = params.toString();
      router.push(query ? `/dashboard/notes?${query}` : "/dashboard/notes");
    },
    [page, router, searchQuery, showFavoritesOnly, typeFilter, tagFilter]
  );

  const fetchNotes = useCallback(
    async (
      pageNum: number,
      search: string,
      type: TypeFilter,
      favOnly: boolean,
      sort: SortValue = "recent",
      tag?: string
    ) => {
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("pageSize", "20");
      params.append("fields", "id,userId,type,title,isFavorite,tags,createdAt,updatedAt");
      params.append("sort", sort);

      if (type !== "all") params.append("type", type);
      if (favOnly) params.append("favorite", "true");
      if (search) params.append("search", search);
      if (tag) params.append("tag", tag);

      try {
        const response = await fetch(`/api/notes?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes as Note[]);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    },
    []
  );

  const handleToggleFavorite = useCallback(
    async (noteId: string, currentFavorite: boolean) => {
      const newFavorite = !currentFavorite;

      setNotes((prevNotes) => {
        if (showFavoritesOnly && !newFavorite) {
          return prevNotes.filter((note) => note.id !== noteId);
        }

        return prevNotes.map((note) =>
          note.id === noteId ? { ...note, isFavorite: newFavorite } : note
        );
      });

      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newFavorite }),
        });

        if (!response.ok) throw new Error("Failed to update");
      } catch (error) {
        console.error("Error toggling favorite:", error);
fetchNotes(page, debouncedSearchQuery, typeFilter, showFavoritesOnly, sortBy, tagFilter);
      }
    },
    [debouncedSearchQuery, fetchNotes, page, showFavoritesOnly, sortBy, typeFilter]
  );

  const handleTypeFilterChange = (newType: TypeFilter) => {
    startTransition(() => {
      setTypeFilter(newType);
      setPage(1);
      updateURL(1, debouncedSearchQuery, newType, showFavoritesOnly ? "favorites" : undefined, tagFilter);
    });
  };

  const handleFavoritesToggle = () => {
    const newState = !showFavoritesOnly;
    setShowFavoritesOnly(newState);
    startTransition(() => {
      setPage(1);
      updateURL(1, debouncedSearchQuery, typeFilter, newState ? "favorites" : undefined, tagFilter);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(() => {
      updateURL(newPage, debouncedSearchQuery, typeFilter, showFavoritesOnly ? "favorites" : undefined, tagFilter);
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setTypeFilter("all");
    setShowFavoritesOnly(false);
    setTagFilter("");
    setPage(1);
    router.push("/dashboard/notes");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes(page, debouncedSearchQuery, typeFilter, showFavoritesOnly, sortBy, tagFilter);
  }, [page, typeFilter, showFavoritesOnly, sortBy, debouncedSearchQuery, fetchNotes, tagFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get("search") || "")) {
      startTransition(() => {
        setPage(1);
        updateURL(1, debouncedSearchQuery, typeFilter, showFavoritesOnly ? "favorites" : undefined, tagFilter);
      });
    }
  }, [debouncedSearchQuery, searchParams, showFavoritesOnly, typeFilter, updateURL, tagFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchQuery) count += 1;
    if (typeFilter !== "all") count += 1;
    if (showFavoritesOnly) count += 1;
    if (tagFilter) count += 1;
    return count;
  }, [debouncedSearchQuery, showFavoritesOnly, typeFilter, tagFilter]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-8 py-6 font-sans">
      <header className="sticky top-0 z-30 -mx-5 border-b border-default bg-[#FFFFFF] dark:bg-[#1A1A1A] px-5 ">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary">
                <FileText className="h-3.5 w-3.5" />
                Notes Workspace
              </div>
              <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl">
                Notes Library
              </h1>
              <p className="mt-1 text-xs font-medium text-secondary">
                {notes.length} visible notes across your personal vault.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="group relative min-w-0 flex-1 sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary/60 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-default bg-surface pl-9 pr-9 text-sm font-medium text-primary outline-none transition-colors duration-100 placeholder:text-secondary/50 focus:bg-[#FFFFFF] dark:focus:bg-[#1A1A1A]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Link
                href="/dashboard/notes/new"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] active:scale-[0.98] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-lg border border-default bg-surface p-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
                <Filter className="h-3.5 w-3.5" />
              </div>

              {(["all", "dsa", "qa", "general"] as const).map((type) => {
                const isActive = typeFilter === type;
                const label = type === "all" ? "All" : NOTE_TYPE_STYLES[type].label;
                const className =
                  type === "all"
                    ? isActive
                      ? "border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]"
                      : "border-default bg-bg-muted text-secondary hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D]"
                    : isActive
                      ? NOTE_TYPE_STYLES[type].filterChipActive
                      : NOTE_TYPE_STYLES[type].filterChip;

                return (
                  <FilterChip
                    key={type}
                    active={isActive}
                    className={className}
                    onClick={() => handleTypeFilterChange(type)}
                  >
                    {label}
                  </FilterChip>
                );
              })}

              <button
                type="button"
                onClick={handleFavoritesToggle}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100",
                  showFavoritesOnly
                    ? "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                    : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
                )}
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    showFavoritesOnly ? "fill-amber-500 text-amber-500" : "text-secondary/70"
                  )}
                />
                Favorites
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-8 rounded-lg border border-default bg-surface px-3 text-[10px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                >
                  Clear {activeFilterCount}
                </button>
              )}
            </div>

            <SortMenu
              sortBy={sortBy}
              open={showSortDropdown}
              onOpenChange={setShowSortDropdown}
              onSortChange={setSortBy}
            />
          </div>
        </div>
      </header>

      <main className="mt-5">
        {isPending || (notes.length === 0 && totalPagesState > 0) ? (
          <SkeletonGrid />
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-primary">No notes found</h3>
            <p className="mt-1 max-w-sm text-sm font-medium text-secondary">
              Try a different search term, adjust the filters, or create a new note.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-4 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
              >
                Clear filters
              </button>
              <Link
                href="/dashboard/notes/new"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
              >
                <Plus className="h-3.5 w-3.5" />
                New Note
              </Link>
            </div>
          </div>
        )}

        {totalPagesState > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex h-9 items-center gap-1 rounded-lg border border-default bg-surface px-3 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-30"
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
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors duration-100",
                      page === pageNum
                        ? "border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]"
                        : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPagesState}
              className="flex h-9 items-center gap-1 rounded-lg border border-default bg-surface px-3 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

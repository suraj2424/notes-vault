"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Note, NoteType } from "@/types";
import { NOTE_TYPE_META, DIFFICULTY_STYLES } from "@/lib/note-styles";

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

const NOTE_TYPE_STYLES = NOTE_TYPE_META;

const SKELETON_SHIMMER_STYLE = `
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
`;

function stripMarkdown(content: string) {
  return content.replace(/[#*_`>[\]()]/g, "").replace(/\s+/g, " ").trim();
}

function getNotePreview(note: Note) {
  if (note.type === "qa") return stripMarkdown(note.qa?.content || "");
  if (note.type === "dsa")
    return stripMarkdown(note.dsa?.problemStatement || note.dsa?.notes || "");
  return stripMarkdown(note.content || "");
}

const TypeIcon = memo(function TypeIcon({ type }: { type: NoteType }) {
  const meta = NOTE_TYPE_STYLES[type];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
        meta.iconWrap
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
});

const TypeBadge = memo(function TypeBadge({ type }: { type: NoteType }) {
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
});

const NoteCard = memo(function NoteCard({
  note,
  onToggleFavorite,
  preview,
  formattedDate,
}: {
  note: Note;
  onToggleFavorite: (noteId: string, currentFavorite: boolean) => void;
  preview: string;
  formattedDate: string;
}) {

  return (
    <Link
      href={`/dashboard/notes/${note.id}`}
      className={cn(
        "group relative flex h-full min-h-44 flex-col overflow-hidden rounded-lg border border-default bg-surface transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5",
        NOTE_TYPE_STYLES[note.type].accentBorder
      )}
    >
      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-start gap-3">
          <TypeIcon type={note.type} />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-primary transition-colors duration-150 group-hover:text-secondary">
              {note.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(note.id, note.isFavorite);
            }}
            className={cn(
              "relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-150",
              note.isFavorite
                ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                : "border-default bg-surface text-secondary/60 hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500"
            )}
            aria-label={
              note.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={
              note.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Star
              className={cn("h-3.5 w-3.5", note.isFavorite && "fill-amber-500")}
            />
          </button>
        </div>

        {note.type === "dsa" && note.dsa && (
          <div className="mt-3 max-h-6 overflow-hidden">
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        )}

        {preview && (
          <div className="mt-3 overflow-hidden">
            <p className="line-clamp-2 text-xs font-medium leading-6 text-secondary">
              {note.type === "qa" ? `\u201C${preview}\u201D` : preview}
            </p>
          </div>
        )}

        {!!note.tags?.length && (
          <div className="mt-3 max-h-6 overflow-hidden">
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-3 border-t border-default pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <TypeBadge type={note.type} />
              <span className="truncate text-[11px] font-medium text-secondary">
                {formattedDate}
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-secondary transition-colors duration-150 group-hover:text-primary">
              Open
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

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
        "h-8 shrink-0 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100",
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
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-default bg-surface px-2.5 text-[10px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary sm:h-9 sm:px-3 sm:text-xs"
        aria-label="Sort notes"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {sortOptions.find((o) => o.value === sortBy)?.label ?? "Most Recent"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-100",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-default bg-surface shadow-md">
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
          className="relative h-52 overflow-hidden rounded-lg border border-default bg-surface dark:bg-[#161616]"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/[0.02]" />
        </div>
      ))}
      <style>{SKELETON_SHIMMER_STYLE}</style>
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
  const [searchQuery, setSearchQuery] = useState(() => {
  return searchParams.get("search") || "";
});
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => {
  return searchParams.get("search") || "";
});
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(() => {
  const type = searchParams.get("type");
  return type && ["dsa", "qa", "general"].includes(type) ? (type as TypeFilter) : "all";
});
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(() => {
  return searchParams.get("filter") === "favorites";
});
  const [tagFilter, setTagFilter] = useState(() => {
  return searchParams.get("tag") || "";
});
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);

  const filtersRef = useRef({
    page,
    debouncedSearchQuery,
    typeFilter,
    showFavoritesOnly,
    sortBy,
    tagFilter,
  });

  useEffect(() => {
    filtersRef.current = {
      page,
      debouncedSearchQuery,
      typeFilter,
      showFavoritesOnly,
      sortBy,
      tagFilter,
    };
  });

  // useEffect(() => {
  //   const search = searchParams.get("search") || "";
  //   const type = searchParams.get("type") as NoteType | null;
  //   const filter = searchParams.get("filter");
  //   const tag = searchParams.get("tag") || "";

  //   setSearchQuery(search);
  //   setDebouncedSearchQuery(search);
  //   setTypeFilter(
  //     type && ["dsa", "qa", "general"].includes(type) ? type : "all"
  //   );
  //   setShowFavoritesOnly(filter === "favorites");
  //   setTagFilter(tag);
  // }, [searchParams]);

  const updateURL = useCallback(
    (
      newPage: number,
      newSearch: string,
      newType: TypeFilter,
      favOnly: boolean,
      newTag: string
    ) => {
      const params = new URLSearchParams();
      params.set("page", newPage.toString());

      if (newSearch) params.set("search", newSearch);
      if (newType !== "all") params.set("type", newType);
      if (favOnly) params.set("filter", "favorites");
      if (newTag) params.set("tag", newTag);

      const query = params.toString();
      router.push(query ? `/dashboard/notes?${query}` : "/dashboard/notes");
    },
    [router]
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
      params.append(
        "fields",
        "id,userId,type,title,isFavorite,tags,createdAt,updatedAt"
      );
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
    (noteId: string, currentFavorite: boolean) => {
      const newFavorite = !currentFavorite;
      const f = filtersRef.current;

      setNotes((prevNotes) => {
        if (f.showFavoritesOnly && !newFavorite) {
          return prevNotes.filter((note) => note.id !== noteId);
        }
        return prevNotes.map((note) =>
          note.id === noteId ? { ...note, isFavorite: newFavorite } : note
        );
      });

      fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newFavorite }),
      }).catch((error) => {
        console.error("Error toggling favorite:", error);
        // Re-fetch only if needed, using stable ref
        fetchNotes(
          f.page,
          f.debouncedSearchQuery,
          f.typeFilter,
          f.showFavoritesOnly,
          f.sortBy,
          f.tagFilter
        );
      });
    },
    [] // Empty deps - uses filtersRef for current values
  );

  const handleTypeFilterChange = useCallback(
    (newType: TypeFilter) => {
      setTypeFilter(newType);
      setPage(1);
      const f = filtersRef.current;
      startTransition(() => {
        updateURL(1, f.debouncedSearchQuery, newType, f.showFavoritesOnly, f.tagFilter);
      });
    },
    [updateURL]
  );

  const handleFavoritesToggle = useCallback(() => {
    setShowFavoritesOnly((prev) => {
      const newState = !prev;
      setPage(1);
      const f = filtersRef.current;
      startTransition(() => {
        updateURL(1, f.debouncedSearchQuery, f.typeFilter, newState, f.tagFilter);
      });
      return newState;
    });
  }, [updateURL]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      const f = filtersRef.current;
      startTransition(() => {
        updateURL(newPage, f.debouncedSearchQuery, f.typeFilter, f.showFavoritesOnly, f.tagFilter);
      });
    },
    [updateURL]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setTypeFilter("all");
    setShowFavoritesOnly(false);
    setTagFilter("");
    setPage(1);
    router.push("/dashboard/notes");
  }, [router]);

  useEffect(() => {
    fetchNotes(
      page,
      debouncedSearchQuery,
      typeFilter,
      showFavoritesOnly,
      sortBy,
      tagFilter
    );
  }, [page, typeFilter, showFavoritesOnly, sortBy, debouncedSearchQuery, tagFilter, fetchNotes]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearchQuery !== currentSearch) {
      setPage(1);
      startTransition(() => {
        updateURL(
          1,
          debouncedSearchQuery,
          typeFilter,
          showFavoritesOnly,
          tagFilter
        );
      });
    }
  }, [debouncedSearchQuery, searchParams, showFavoritesOnly, tagFilter, typeFilter, updateURL]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchQuery) count += 1;
    if (typeFilter !== "all") count += 1;
    if (showFavoritesOnly) count += 1;
    if (tagFilter) count += 1;
    return count;
  }, [debouncedSearchQuery, showFavoritesOnly, typeFilter, tagFilter]);

  const skeletonGrid = useMemo(() => <SkeletonGrid />, []);

  const notesWithPreviews = useMemo(() => {
    return notes.map((note) => ({
      note,
      preview: getNotePreview(note),
      formattedDate: formatDistanceToNow(new Date(note.updatedAt), {
        addSuffix: true,
      }),
    }));
  }, [notes]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 font-sans">
      <header className="sticky top-0 z-30 -mx-4 border-b border-default bg-surface/95 dark:bg-[#1A1A1A] px-4 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="min-w-0">
              <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-primary sm:text-2xl lg:text-3xl">
                Notes Library
              </h1>
              <p className="mt-1 text-xs font-medium text-secondary">
                {notes.length} visible notes across your personal vault.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="group relative min-w-0 flex-1 sm:w-72 lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary/60 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-default bg-surface pl-9 pr-8 text-sm font-medium text-primary outline-none transition-colors duration-100 placeholder:text-secondary/50 focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#00A3A3]/30 dark:focus:bg-[#1A1A1A] dark:focus:ring-[#00E0E0]/20 sm:h-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Link
                href="/dashboard/notes/new"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1A1D1E] px-3 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] active:scale-[0.98] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0] sm:h-10 sm:gap-2 sm:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-default bg-surface p-2 sm:p-3">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary sm:flex">
              <Filter className="h-3.5 w-3.5" />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible sm:gap-2">
              {(["all", "dsa", "qa", "general"] as const).map((type) => {
                const isActive = typeFilter === type;
                const label =
                  type === "all" ? "All" : NOTE_TYPE_STYLES[type].label;
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
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100 sm:px-3",
                  showFavoritesOnly
                    ? "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                    : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
                )}
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    showFavoritesOnly
                      ? "fill-amber-500 text-amber-500"
                      : "text-secondary/70"
                  )}
                />
                <span className="hidden sm:inline">Favorites</span>
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-default bg-surface px-2.5 text-[10px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary sm:px-3"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:hidden">{activeFilterCount}</span>
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

      <main className="mt-4 sm:mt-5">
        {isPending || (notes.length === 0 && totalPagesState > 0) ? (
          skeletonGrid
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
            {notesWithPreviews.map(({ note, preview, formattedDate }) => (
              <NoteCard
                key={note.id}
                note={note}
                onToggleFavorite={handleToggleFavorite}
                preview={preview}
                formattedDate={formattedDate}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center sm:min-h-[360px]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-default bg-bg-muted text-secondary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-primary">No notes found</h3>
            <p className="mt-1 max-w-xs text-sm font-medium text-secondary sm:max-w-sm">
              {activeFilterCount > 0
                ? "Try adjusting your filters or search terms."
                : "Create your first note to get started."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-6">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex h-9 items-center rounded-lg border border-default bg-surface px-4 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                >
                  Clear filters
                </button>
              )}
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
          <div className="mt-6 flex items-center justify-center gap-1.5 sm:mt-8 sm:gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex h-8 items-center gap-1 rounded-lg border border-default bg-surface px-2 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-30 sm:h-9 sm:px-3"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {Array.from(
                { length: Math.min(5, totalPagesState) },
                (_, i) => {
                  let pageNum: number;
                  if (totalPagesState <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPagesState - 2)
                    pageNum = totalPagesState - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors duration-100 sm:h-9 sm:w-9",
                        page === pageNum
                          ? "border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]"
                          : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPagesState}
              className="flex h-8 items-center gap-1 rounded-lg border border-default bg-surface px-2 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-30 sm:h-9 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

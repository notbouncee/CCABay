// ExplorePage - CCA Wiki with grid display and category filters
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import CCACard from "@/components/CCACard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Star } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const categories = ["All", "Performance & Creativity", "Competition & Academics", "Community & Lifestyle", "Cultural", "Sports"];
const categoryFilterOptions = ["Sports", "Performing Arts", "Service", "Academics", "Arts", "Orientation", "Cultural", "Faith-Based", "Competition-Based", "Recreational"];
const goalsFilterOptions = ["Leadership", "Social Connection", "Skill Development", "Build Portfolio", "Staying Active", "Giving Back"];
const lifestyleFilterOptions = ["Low Commitment", "Flexible Schedule", "Beginner Friendly", "Team-Based", "Weekend-Based"];
const appStatusFilterOptions = ["Open", "Closing Soon", "Closed"];

const parseCategoryTagsParam = (raw: string | null) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

const ExploreCCARow: React.FC<{
  cca: Tables<"ccas">;
  isSaved: boolean;
  onToggleSave: (ccaId: string) => void;
  isClickable?: boolean;
}> = ({ cca, isSaved, onToggleSave, isClickable = true }) => {
  const parseCategoryTags = () => {
    const rawCategoryTags = (cca as Tables<"ccas"> & { category_tags?: string[] | string | null }).category_tags;

    if (Array.isArray(rawCategoryTags)) {
      return rawCategoryTags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
    }

    if (typeof rawCategoryTags === "string") {
      try {
        const parsed = JSON.parse(rawCategoryTags);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const parseOtherTags = () => {
    const rawOtherTags = (cca as Tables<"ccas"> & { other_tags?: string[] | string | null }).other_tags;

    if (Array.isArray(rawOtherTags)) {
      return rawOtherTags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
    }

    if (typeof rawOtherTags === "string") {
      try {
        const parsed = JSON.parse(rawOtherTags);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const categoryTags = parseCategoryTags();
  const dbTags = (cca.tags ?? []).filter(Boolean);
  const primaryTag = categoryTags[0] || dbTags[0] || cca.category;
  const secondaryTag = categoryTags[1] || dbTags[1] || cca.category;
  const otherTags = parseOtherTags();
  const isApplicationClosed = otherTags.some((tag) => tag.trim().toLowerCase() === "closed");
  const isClosingSoon = otherTags.some((tag) => tag.trim().toLowerCase() === "closing soon");
  const commitment = cca.weekly_commitment || "Medium";
  const hallPoints = cca.hall_points ?? 3;

  const formatTryoutDate = (rawDate: string | null) => {
    if (!rawDate) return "12 Aug 2026";
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return parsed.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const trialDateText = (cca as Tables<"ccas"> & { trial_date?: string | null }).trial_date;
  const trialDate = trialDateText && trialDateText.trim().length > 0
    ? trialDateText
    : formatTryoutDate(cca.tryout_dates);

  const parseDisplayDate = (rawDate: string) => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const getApplicationClosingInfo = () => {
    const referenceToday = new Date("2026-08-10T00:00:00");
    const candidateDate =
      (trialDateText && parseDisplayDate(trialDateText)) ||
      (cca.tryout_dates && parseDisplayDate(cca.tryout_dates)) ||
      (cca.audition_dates && parseDisplayDate(cca.audition_dates));

    if (!candidateDate) {
      return null;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.ceil((candidateDate.getTime() - referenceToday.getTime()) / msPerDay);
    const formattedDate = candidateDate.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      formattedDate,
      daysLeft: Math.max(diffInDays, 0),
    };
  };

  const closingInfo = isClosingSoon ? getApplicationClosingInfo() : null;

  const rowContent = (
    <>
      <article className="overflow-hidden rounded-[20px] border border-border bg-card shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-44 w-full overflow-hidden bg-[#E6E6E6] md:h-auto md:w-[260px] md:flex-shrink-0">
            {cca.image_url ? (
              <img src={cca.image_url} alt={cca.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-montserrat text-[12px] font-semibold text-[#8C8C8C]">
                No image
              </div>
            )}

            <button
              type="button"
              aria-label={isSaved ? "Saved" : "Save"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(cca.id);
              }}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center"
            >
              <Bookmark className={`h-8 w-8 ${isSaved ? "fill-[#FFD000] text-[#FFD000]" : "text-white"}`} />
            </button>
          </div>

          <div className="flex-1 p-5">
            <h3 className="font-anton text-[30px] leading-none text-[#23286F]">{cca.name}</h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex h-6 min-w-[140px] items-center justify-center rounded-full bg-[#989DED] px-3.5 font-montserrat text-[11px] font-bold text-white">
                {primaryTag}
              </span>
              <span className="flex h-6 min-w-[140px] items-center justify-center rounded-full bg-[rgba(24,28,98,0.67)] px-3.5 font-montserrat text-[11px] font-bold text-white">
                {secondaryTag}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-montserrat text-[12px] font-bold">
              <div className="flex items-center gap-2">
                <span className="text-[#8C8C8C]">Commitment</span>
                <span className="rounded-full bg-[#FF9900]/15 px-3 py-[2px] text-[#FF9900]">{commitment}</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4A4A]">
                <span className="text-[#8C8C8C]">Hall Points</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-[#FFCC00] text-[#FFCC00]" />
                  {hallPoints}
                </span>
              </div>
            </div>

            <p className="mt-3 font-montserrat text-[14px] font-normal leading-[1.25] text-[#8C8C8C] line-clamp-3">
              {cca.description}
            </p>

            <div className={`mt-4 flex items-center gap-2 ${isApplicationClosed ? "text-[#8C8C8C]" : isClosingSoon ? "text-[#23286F]" : "text-primary"}`}>
              <img
                src="/icons/dates.png"
                alt="Trials"
                className={`h-4 w-4 object-contain ${isApplicationClosed ? "opacity-60" : ""}`}
              />
              {isApplicationClosed ? (
                <span className="font-montserrat text-[13px] font-bold leading-none text-[#8C8C8C]">
                  Application Closed
                </span>
              ) : isClosingSoon && closingInfo ? (
                <span className="font-montserrat text-[13px] font-bold leading-none text-[#23286F]">
                  {`Application Closes: ${closingInfo.formattedDate} `}
                  <span className="text-[#D71440]">({closingInfo.daysLeft} {closingInfo.daysLeft === 1 ? "day" : "days"} left)</span>
                </span>
              ) : (
                <span className="font-montserrat text-[13px] font-bold leading-none">Trials: {trialDate}</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );

  if (isClickable) {
    return (
      <Link to={`/cca/${cca.id}`} className="block">
        {rowContent}
      </Link>
    );
  }

  return <div className="block">{rowContent}</div>;
};

// CCA exploration page with search and category filters
const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categoryTagsParam = searchParams.get("category_tags");
  const initialCategory = categoryParam || "All";
  const initialFilterTags = parseCategoryTagsParam(categoryTagsParam);
  const categoryLabel = searchParams.get("category_label");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"rows" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>(initialFilterTags);
  const [showCategories, setShowCategories] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showLifestyle, setShowLifestyle] = useState(false);
  const [showAppStatus, setShowAppStatus] = useState(false);

  const clearCategoryLabel = () => {
    if (!searchParams.get("category_label")) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category_label");
    setSearchParams(nextParams);
  };

  const toggleFilterTag = (tag: string) => {
    clearCategoryLabel();
    setSelectedFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Fetch all CCAs
  const { data: ccas, isLoading } = useQuery({
    queryKey: ["all-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const parseTagField = (rawValue: string[] | string | null | undefined) => {
    if (Array.isArray(rawValue)) {
      return rawValue.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
    }

    if (typeof rawValue === "string") {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const selectedCategoryTagSet = new Set(categoryFilterOptions.map((tag) => tag.toLowerCase()));
  const selectedCategoryTags = selectedFilterTags.filter((tag) => selectedCategoryTagSet.has(tag.toLowerCase()));
  const selectedOtherTags = selectedFilterTags.filter((tag) => !selectedCategoryTagSet.has(tag.toLowerCase()));

  // Filter CCAs by category, search and sidebar tags
  const filteredCCAs = useMemo(() => ccas?.filter((cca) => {
    const matchesCategory = selectedCategory === "All" || cca.category === selectedCategory;
    const matchesSearch = cca.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const categoryTags = parseTagField((cca as Tables<"ccas"> & { category_tags?: string[] | string | null }).category_tags)
      .map((tag) => tag.toLowerCase());
    const otherTags = parseTagField((cca as Tables<"ccas"> & { other_tags?: string[] | string | null }).other_tags)
      .map((tag) => tag.toLowerCase());

    const hasAnySidebarFilter = selectedFilterTags.length > 0;
    const matchesCategoryTags = selectedCategoryTags.some((tag) => categoryTags.includes(tag.toLowerCase()));
    const matchesOtherTags = selectedOtherTags.some((tag) => otherTags.includes(tag.toLowerCase()));
    const matchesSidebarFilters = !hasAnySidebarFilter || matchesCategoryTags || matchesOtherTags;

    return matchesCategory && matchesSearch && matchesSidebarFilters;
  }) ?? [], [ccas, selectedCategory, searchQuery, selectedCategoryTags, selectedOtherTags]);

  const totalPages = Math.max(1, Math.ceil(filteredCCAs.length / cardsPerPage));
  const paginatedCCAs = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredCCAs.slice(start, start + cardsPerPage);
  }, [filteredCCAs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedFilterTags]);

  useEffect(() => {
    const urlCategory = categoryParam || "All";
    const urlFilterTags = parseCategoryTagsParam(categoryTagsParam);
    setSelectedCategory(urlCategory);
    setSelectedFilterTags(urlFilterTags);
  }, [categoryParam, categoryTagsParam]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Fetch user's wishlist to determine saved status
  const { data: wishlistIds } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cca_wishlist").select("cca_id").eq("user_id", user!.id);
      if (error) throw error;
      return data?.map((w) => w.cca_id) || [];
    },
    enabled: !!user,
  });

  // Toggle save CCA mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ ccaId, isSaved }: { ccaId: string; isSaved: boolean }) => {
      if (!user) {
        navigate("/login");
        return;
      }
      if (isSaved) {
        await supabase.from("cca_wishlist").delete().eq("cca_id", ccaId).eq("user_id", user.id);
      } else {
        await supabase.from("cca_wishlist").insert({ cca_id: ccaId, user_id: user.id });
      }
    },
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["saved-ccas"] });
      toast({ title: isSaved ? "Removed from saved CCAs" : "Saved to wishlist!" });
    },
  });

  const handleToggleSave = (ccaId: string) => {
    const isSaved = wishlistIds?.includes(ccaId) || false;
    toggleSaveMutation.mutate({ ccaId, isSaved });
  };

  // Handle category selection
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const controlsBar = (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => {
          setShowFilters((prev) => {
            const next = !prev;
            if (next) {
              setShowCategories(false);
              setShowGoals(false);
              setShowLifestyle(false);
              setShowAppStatus(false);
            }
            return next;
          });
        }}
        className="inline-flex h-9 items-center rounded-xl bg-[#E6E6E6] px-5 font-montserrat text-[14px] font-medium leading-none text-[#8C8C8C] transition-colors duration-200 hover:bg-[#D9D9D9] hover:text-[#6F6F6F]"
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      <button
        type="button"
        className="inline-flex h-9 items-center rounded-xl bg-[#E6E6E6] pl-5 pr-3 font-montserrat text-[14px] font-medium leading-none text-[#8C8C8C] transition-colors duration-200 hover:bg-[#D9D9D9] hover:text-[#6F6F6F]"
      >
        Default Sorting
        <img src="/icons/dropdown.png" alt="Dropdown" className="ml-4 h-4 w-4 object-contain [filter:brightness(0)_invert(55%)]" />
      </button>

      <button
        type="button"
        onClick={() => setViewMode("rows")}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
          viewMode === "rows" ? "bg-[#181C62]" : "bg-[#E6E6E6] hover:bg-[#D9D9D9]"
        }`}
      >
        <img
          src="/icons/rows.png"
          alt="Rows view"
          className={`h-5 w-5 object-contain ${viewMode === "rows" ? "[filter:brightness(0)_saturate(100%)_invert(100%)]" : "[filter:brightness(0)_invert(55%)]"}`}
        />
      </button>

      <button
        type="button"
        onClick={() => setViewMode("grid")}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
          viewMode === "grid" ? "bg-[#181C62]" : "bg-[#E6E6E6] hover:bg-[#D9D9D9]"
        }`}
      >
        <img
          src="/icons/grid.png"
          alt="Grid view"
          className={`h-[22px] w-[22px] object-contain ${viewMode === "grid" ? "[filter:brightness(0)_saturate(100%)_invert(100%)]" : "[filter:brightness(0)_invert(55%)]"}`}
        />
      </button>

      <span className="ml-auto font-montserrat text-[14px] font-semibold underline text-[#8C8C8C]">
        Showing {paginatedCCAs.length} of {filteredCCAs.length} Results
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-14">
        <div className="px-6 md:px-10 lg:px-12">
          <h1 className="mb-3 font-anton text-[50px] leading-none text-primary-foreground">Explore CCAs</h1>
          <p className="mb-6 font-montserrat text-[16px] text-primary-foreground/70">
            Browse through NTU’s diverse range of CCAs for AY2025/26
          </p>

          {/* Search bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-[620px]">
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${searchQuery.trim() ? "bg-black" : "bg-[#A5A5A5]"}`}
                style={{
                  WebkitMaskImage: "url('/icons/search.png')",
                  maskImage: "url('/icons/search.png')",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
              />
              <Input
                placeholder="Search CCAs by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-0 bg-card pl-11 font-montserrat text-[16px] font-medium placeholder:text-[16px] placeholder:font-medium placeholder:text-[#A5A5A5] focus:placeholder:text-[#8C8C8C] focus:border-transparent focus:outline-none focus:shadow-none focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Link to="/saved">
              <Button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D71440] px-5 font-montserrat text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D71440] hover:shadow-lg">
                <img
                  src="/icons/saveOption.png"
                  alt="Saved"
                  className="h-5 w-5 object-contain [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(162deg)_brightness(102%)_contrast(101%)]"
                />
                Saved CCAs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-6 pb-10 pt-6 md:px-10 lg:px-12">
        {categoryLabel && (
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[rgba(24,28,98,0.12)] px-4 py-1.5 font-montserrat text-[13px] font-semibold text-[#181C62]">
              Showing category: {categoryLabel}
            </span>
          </div>
        )}
        {/* CCA Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {showFilters ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-x-14">
                {/* Filter Sidebar */}
                <aside className="w-full font-montserrat">
                  {/* Categories */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCategories((p) => !p)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="font-montserrat text-[18px] font-bold text-[#181C62]">Categories</span>
                      <span className="text-[24px] font-medium text-[#181C62] leading-none">{showCategories ? "−" : "+"}</span>
                    </button>
                    <div className="mb-3 mt-1 h-px bg-[#181C62]" />
                    {showCategories && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {categoryFilterOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFilterTag(tag)}
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              selectedFilterTags.includes(tag)
                                ? "bg-[#D71440] text-white"
                                : "bg-[#F0F0F0] text-[#8C8C8C]"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Goals */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowGoals((p) => !p)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="font-montserrat text-[18px] font-bold text-[#181C62]">Goals</span>
                      <span className="text-[24px] font-medium text-[#181C62] leading-none">{showGoals ? "−" : "+"}</span>
                    </button>
                    <div className="mb-3 mt-1 h-px bg-[#181C62]" />
                    {showGoals && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {goalsFilterOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFilterTag(tag)}
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              selectedFilterTags.includes(tag)
                                ? "bg-[#D71440] text-white"
                                : "bg-[#F0F0F0] text-[#8C8C8C]"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lifestyle */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLifestyle((p) => !p)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="font-montserrat text-[18px] font-bold text-[#181C62]">Lifestyle</span>
                      <span className="text-[24px] font-medium text-[#181C62] leading-none">{showLifestyle ? "−" : "+"}</span>
                    </button>
                    <div className="mb-3 mt-1 h-px bg-[#181C62]" />
                    {showLifestyle && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {lifestyleFilterOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFilterTag(tag)}
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              selectedFilterTags.includes(tag)
                                ? "bg-[#D71440] text-white"
                                : "bg-[#F0F0F0] text-[#8C8C8C]"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Application Status */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAppStatus((p) => !p)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="font-montserrat text-[18px] font-bold text-[#181C62]">Application Status</span>
                      <span className="text-[24px] font-medium text-[#181C62] leading-none">{showAppStatus ? "−" : "+"}</span>
                    </button>
                    <div className="mb-3 mt-1 h-px bg-[#181C62]" />
                    {showAppStatus && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {appStatusFilterOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFilterTag(tag)}
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              selectedFilterTags.includes(tag)
                                ? "bg-[#D71440] text-white"
                                : "bg-[#F0F0F0] text-[#8C8C8C]"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      clearCategoryLabel();
                      setSelectedFilterTags([]);
                    }}
                    className="mx-auto mt-10 block w-[160px] rounded-xl border border-[#181C62] py-1 text-[12px] font-semibold text-[#181C62] transition-colors hover:bg-[#181C62] hover:text-white"
                  >
                    Remove All Filters
                  </button>
                </aside>

                <div>
                  {controlsBar}
                  {viewMode === "rows" ? (
                    <div className="space-y-4">
                      {paginatedCCAs.map((cca) => (
                        <ExploreCCARow
                          key={cca.id}
                          cca={cca}
                          isSaved={wishlistIds?.includes(cca.id) || false}
                          onToggleSave={handleToggleSave}
                          isClickable={cca.name === "Contemp{minated}"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {paginatedCCAs.map((cca) => (
                        <CCACard
                          key={cca.id}
                          cca={cca}
                          isSaved={wishlistIds?.includes(cca.id) || false}
                          onToggleSave={handleToggleSave}
                          isClickable={cca.name === "Contemp{minated}"}
                        />
                      ))}
                    </div>
                  )}

                  {paginatedCCAs.length === 0 && (
                    <p className="mt-8 text-center font-montserrat text-[15px] font-medium text-[#8C8C8C]">
                      No CCAs found for this search.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {controlsBar}
                {viewMode === "rows" ? (
                  <div className="space-y-4">
                    {paginatedCCAs.map((cca) => (
                      <ExploreCCARow
                        key={cca.id}
                        cca={cca}
                        isSaved={wishlistIds?.includes(cca.id) || false}
                        onToggleSave={handleToggleSave}
                        isClickable={cca.name === "Contemp{minated}"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {paginatedCCAs.map((cca) => (
                      <CCACard
                        key={cca.id}
                        cca={cca}
                        isSaved={wishlistIds?.includes(cca.id) || false}
                        onToggleSave={handleToggleSave}
                        isClickable={cca.name === "Contemp{minated}"}
                      />
                    ))}
                  </div>
                )}

                {paginatedCCAs.length === 0 && (
                  <p className="mt-8 text-center font-montserrat text-[15px] font-medium text-[#8C8C8C]">
                    No CCAs found for this search.
                  </p>
                )}
              </>
            )}

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center font-montserrat text-[14px] font-semibold text-[#8C8C8C] disabled:opacity-30"
              >
                <img src="/icons/dropdown.png" alt="Previous" className="h-4 w-4 object-contain rotate-90 [filter:brightness(0)_invert(55%)]" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md font-montserrat text-[13px] font-bold transition-colors ${
                    page === currentPage
                      ? "bg-[#181C62] text-white"
                      : "bg-[#E6E6E6] text-[#8C8C8C]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center font-montserrat text-[14px] font-semibold text-[#8C8C8C] disabled:opacity-30"
              >
                <img src="/icons/dropdown.png" alt="Next" className="h-4 w-4 object-contain -rotate-90 [filter:brightness(0)_invert(55%)]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

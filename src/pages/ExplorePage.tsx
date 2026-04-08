// ExplorePage - CCA Wiki with grid display and category filters
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import CCACard from "@/components/CCACard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const categories = ["All", "Performance & Creativity", "Competition & Academics", "Community & Lifestyle", "Cultural", "Sports"];

const fallbackCard: Tables<"ccas"> = {
  id: "fallback-contemp",
  name: "Contemp{minated}",
  category: "Performance & Creativity",
  description: "Express yourself through contemporary dance, performance, and team spirit.",
  tags: ["Recreational", "Medium"],
  image_url: "/images/contemp.png",
  hall_points: 3,
  weekly_commitment: "Medium",
  tryout_dates: "2026-08-12",
  about: null,
  audition_dates: null,
  contact_email: null,
  created_at: "2026-01-01T00:00:00.000Z",
  instagram_url: null,
  is_beginner_friendly: null,
  training_days: null,
  training_time: null,
  updated_at: "2026-01-01T00:00:00.000Z",
};

// CCA exploration page with search and category filters
const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"rows" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(2);
  const totalPages = 3;
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>(["Performing Arts"]);
  const [showCategories, setShowCategories] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showLifestyle, setShowLifestyle] = useState(false);
  const [showAppStatus, setShowAppStatus] = useState(false);

  const toggleFilterTag = (tag: string) => {
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

  // Filter CCAs by category and search
  const filteredCCAs = ccas?.filter((cca) => {
    const matchesCategory = selectedCategory === "All" || cca.category === selectedCategory;
    const matchesSearch = cca.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const sourceCard = filteredCCAs?.[0] || fallbackCard;
  const repeatedCards = Array.from({ length: 12 }, () => sourceCard);

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
        Showing 12 of 200 Results
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
                        {["Sports","Performing Arts","Service","Academics","Arts","Orientation","Cultural","Faith-Based","Competition-Based","Recreational"].map((tag) => (
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
                        {["Leadership","Social Connection","Skill Development","Build Portfolio","Staying Active","Giving Back"].map((tag) => (
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
                        {["Low Commitment","Flexible Schedule","Beginner Friendly","Team-Based","Weekend-Based"].map((tag) => (
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
                        {["Open","Closing Soon","Closed"].map((tag) => (
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
                    onClick={() => setSelectedFilterTags([])}
                    className="mx-auto mt-10 block w-[160px] rounded-xl border border-[#181C62] py-1 text-[12px] font-semibold text-[#181C62] transition-colors hover:bg-[#181C62] hover:text-white"
                  >
                    Remove All Filters
                  </button>
                </aside>

                <div>
                  {controlsBar}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {repeatedCards.map((cca, index) => (
                      <CCACard key={`${cca.id}-repeat-${index}`} cca={cca} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {controlsBar}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {repeatedCards.map((cca, index) => (
                    <CCACard key={`${cca.id}-repeat-${index}`} cca={cca} />
                  ))}
                </div>
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

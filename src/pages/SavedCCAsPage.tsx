// SavedCCAsPage - Display user's saved/wishlisted CCAs with grid/row view and sorting
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Calendar, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

// Row card for saved CCA
const SavedCCARow: React.FC<{
  item: { id: string; ccas: Tables<"ccas"> | null };
  onRemove: (id: string) => void;
  onView: (cca: Tables<"ccas">) => void;
}> = ({ item, onRemove, onView }) => {
  const cca = item.ccas;
  if (!cca) return null;

  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border flex flex-col md:flex-row">
      {/* Left: Image */}
      <div className="md:w-48 h-40 md:h-auto bg-gradient-to-br from-primary to-navy-light flex-shrink-0 flex items-center justify-center">
        {cca.image_url ? (
          <img src={cca.image_url} alt={cca.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-anton text-4xl text-primary-foreground/30">{cca.name.charAt(0)}</span>
        )}
      </div>

      {/* Middle: Details */}
      <div className="flex-1 p-5">
        <h3
          className="font-anton text-2xl text-accent italic cursor-pointer hover:underline"
          onClick={() => onView(cca)}
        >
          {cca.name}
        </h3>
        <p className="text-sm text-muted-foreground font-montserrat mt-1">
          {cca.weekly_commitment}{cca.hall_points ? ` | ${cca.hall_points} Hall Points` : ""}
        </p>
        <p className="text-sm text-muted-foreground font-montserrat mt-2 line-clamp-2">
          {cca.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-3">
          {cca.tags?.map((tag) => (
            <Badge key={tag} variant="default" className="text-xs font-montserrat">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="p-5 flex flex-col gap-2 justify-center items-end">
        <Button
          variant="accent"
          size="sm"
          className="font-montserrat"
          onClick={() => onView(cca)}
        >
          <Calendar className="h-4 w-4" />
          View Details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
};

// Grid card for saved CCA (similar to CCACard)
const SavedCCACard: React.FC<{
  item: { id: string; ccas: Tables<"ccas"> | null };
  onRemove: (id: string) => void;
  onView: (cca: Tables<"ccas">) => void;
}> = ({ item, onRemove, onView }) => {
  const cca = item.ccas;
  if (!cca) return null;

  const primaryTag = cca.category === "Performance & Creativity"
    ? "Performing Arts"
    : cca.category === "Competition & Academics"
      ? "Competition"
      : cca.category === "Community & Lifestyle"
        ? "Community"
        : cca.category;

  const secondaryTag = cca.tags?.[0] || "Recreational";
  const commitment = cca.weekly_commitment || "Medium";
  const hallPoints = cca.hall_points ?? 3;

  return (
    <article className="overflow-hidden rounded-[20px] bg-white transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: "0 0 10px 0 rgba(0,0,0,0.10)" }}>
      <div className="relative h-[148px] overflow-hidden">
        {cca.image_url ? (
          <img src={cca.image_url} alt={cca.name} className="h-full w-full object-cover" />
        ) : (
          <img src="/images/contemp.png" alt={cca.name} className="h-full w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_28%,rgba(0,0,0,0.28)_72%,rgba(0,0,0,0.46)_100%)]" />
        <h3 className="absolute bottom-3 left-4 font-anton text-[24px] leading-none text-white">
          {cca.name}
        </h3>
        <button
          type="button"
          aria-label="Remove from saved"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center"
        >
          <img
            src="/icons/saveOption.png"
            alt="Remove"
            className="h-8 w-8 object-contain [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(162deg)_brightness(102%)_contrast(101%)]"
          />
        </button>
      </div>

      <div className="px-4 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 min-w-[132px] items-center justify-center rounded-full bg-[#989DED] px-3.5 font-montserrat text-[10px] font-bold text-white">
            {primaryTag}
          </span>
          <span className="flex h-5 min-w-[132px] items-center justify-center rounded-full bg-[rgba(24,28,98,0.67)] px-3.5 font-montserrat text-[10px] font-bold text-white">
            {secondaryTag}
          </span>
        </div>

        <div className="mt-2 h-px w-full bg-[#D9D9D9]" />

        <div className="mt-2.5 flex items-center font-montserrat text-[10px] font-bold">
          <span className="text-[#8C8C8C]">Commitment</span>
          <span className="ml-1.5 rounded-full bg-[#FF9900]/15 px-3 py-[2px] text-[#FF9900]">{commitment}</span>
          <span className="ml-8 text-[#8C8C8C]">Hall Points</span>
          <span className="ml-1.5 inline-flex items-center gap-1 text-[#4A4A4A]">
            <Star className="h-3 w-3 fill-[#FFCC00] text-[#FFCC00]" />
            {hallPoints}
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 font-montserrat text-[14px] font-normal leading-[1.25] text-[#8C8C8C]">
          {cca.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onView(cca)}
            className="flex items-center gap-2 font-montserrat text-[12px] font-bold text-primary hover:underline"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 font-montserrat text-[12px] font-bold text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

// Saved CCAs page with grid/row view and sorting
const SavedCCAsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"rows" | "grid">("grid");
  const [selectedCCA, setSelectedCCA] = useState<Tables<"ccas"> | null>(null);

  // Fetch saved CCAs with CCA details
  const { data: savedCCAs, isLoading } = useQuery({
    queryKey: ["saved-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cca_wishlist")
        .select("*, ccas(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Remove from wishlist
  const removeMutation = useMutation({
    mutationFn: async (wishlistId: string) => {
      await supabase.from("cca_wishlist").delete().eq("id", wishlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-ccas"] });
      toast({ title: "Removed from saved CCAs" });
    },
  });

  // Filter saved CCAs by search
  const filtered = savedCCAs?.filter((item) => {
    const cca = item.ccas;
    if (!cca) return false;
    const matchesSearch = cca.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cca.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalCount = filtered?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-14">
        <div className="px-6 md:px-10 lg:px-12">
          <h1 className="mb-3 font-anton text-[50px] leading-none text-primary-foreground">Saved CCAs</h1>
          <p className="mb-6 font-montserrat text-[16px] text-primary-foreground/70">
            Check out the CCAs you have saved!
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
                placeholder="Search Saved CCAs by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-0 bg-card pl-11 font-montserrat text-[16px] font-medium placeholder:text-[16px] placeholder:font-medium placeholder:text-[#A5A5A5] focus:placeholder:text-[#8C8C8C] focus:border-transparent focus:outline-none focus:shadow-none focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-10 pt-6 md:px-10 lg:px-12">
        {/* Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
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

          <span className="ml-auto font-montserrat text-[14px] font-semibold text-[#8C8C8C]">
            Showing {totalCount} {totalCount === 1 ? "result" : "results"}
          </span>
        </div>

        {/* CCA Display */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered && filtered.length > 0 ? (
          viewMode === "rows" ? (
            <div className="space-y-4">
              {filtered.map((item) => (
                <SavedCCARow
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeMutation.mutate(id)}
                  onView={(cca) => setSelectedCCA(cca)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <SavedCCACard
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeMutation.mutate(id)}
                  onView={(cca) => setSelectedCCA(cca)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-montserrat">No saved CCAs yet. Start exploring and save CCAs you like!</p>
            <Link to="/explore">
              <Button variant="accent" className="mt-4 font-montserrat">
                Explore CCAs
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCCA && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedCCA(null)}
        >
          <div
            className="bg-card rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 md:h-64 overflow-hidden rounded-t-xl">
              {selectedCCA.image_url ? (
                <img src={selectedCCA.image_url} alt={selectedCCA.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center">
                  <span className="font-anton text-6xl text-primary-foreground/30">{selectedCCA.name.charAt(0)}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedCCA(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50"
              >
                <img src="/icons/closeBot.png" alt="Close" className="h-6 w-6 object-contain" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="font-anton text-3xl text-accent italic mb-2">{selectedCCA.name}</h2>
              <p className="text-muted-foreground font-montserrat mb-4">{selectedCCA.about || selectedCCA.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Category:</span> <strong className="font-montserrat">{selectedCCA.category}</strong></div>
                <div><span className="text-muted-foreground">Commitment:</span> <strong className="font-montserrat">{selectedCCA.weekly_commitment}</strong></div>
                <div><span className="text-muted-foreground">Hall Points:</span> <strong className="font-montserrat">{selectedCCA.hall_points || "N/A"}</strong></div>
                <div><span className="text-muted-foreground">Beginner Friendly:</span> <strong className="font-montserrat">{selectedCCA.is_beginner_friendly ? "Yes" : "No"}</strong></div>
                {selectedCCA.training_days && selectedCCA.training_days.length > 0 && (
                  <div><span className="text-muted-foreground">Training Days:</span> <strong className="font-montserrat">{selectedCCA.training_days.join(", ")}</strong></div>
                )}
                {selectedCCA.training_time && (
                  <div><span className="text-muted-foreground">Training Time:</span> <strong className="font-montserrat">{selectedCCA.training_time}</strong></div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-4">
                {selectedCCA.tags?.map((tag) => (
                  <Badge key={tag} className="font-montserrat">{tag}</Badge>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link to={`/cca/${selectedCCA.id}`} className="flex-1">
                  <Button variant="accent" className="w-full font-montserrat">
                    View Full Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCCA(null)}
                  className="font-montserrat"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCCAsPage;

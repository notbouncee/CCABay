// SavedCCAsPage - Display user's saved/wishlisted CCAs with filters
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, X, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

// Saved CCAs page with filtering and expanded modal view
const SavedCCAsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
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

  // Get unique tags for filter
  const allTags = Array.from(
    new Set(savedCCAs?.flatMap((s) => s.ccas?.tags || []) || [])
  );

  // Filter saved CCAs
  const filtered = savedCCAs?.filter((item) => {
    const cca = item.ccas;
    if (!cca) return false;
    const matchesSearch = cca.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === "all" || cca.tags?.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-4xl text-primary-foreground italic">Saved CCA's</h1>
          <p className="text-primary-foreground/70 font-montserrat mt-2">
            Not ready to decide yet? No problem. All the CCAs you saved are listed here so you can explore them later.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Saved CCA's..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setTagFilter("all"); }}>
            Clear Filters
          </Button>
        </div>

        {/* Saved CCA cards */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => {
              const cca = item.ccas;
              if (!cca) return null;
              return (
                <div key={item.id} className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Image */}
                    <div className="md:w-48 h-40 md:h-auto bg-gradient-to-br from-primary to-navy-light flex-shrink-0 flex items-center justify-center">
                      <span className="font-anton text-4xl text-primary-foreground/30">{cca.name.charAt(0)}</span>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 p-5">
                      <h3
                        className="font-anton text-2xl text-accent italic cursor-pointer hover:underline"
                        onClick={() => setSelectedCCA(cca)}
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
                        onClick={() => setSelectedCCA(cca)}
                      >
                        <Calendar className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMutation.mutate(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-montserrat">No saved CCAs yet. Try swiping on MatchMe!</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedCCA} onOpenChange={() => setSelectedCCA(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCCA && (
            <>
              <DialogHeader>
                <DialogTitle className="font-anton text-3xl text-accent italic">
                  {selectedCCA.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground font-montserrat">{selectedCCA.about || selectedCCA.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Category:</span> <strong>{selectedCCA.category}</strong></div>
                  <div><span className="text-muted-foreground">Commitment:</span> <strong>{selectedCCA.weekly_commitment}</strong></div>
                  <div><span className="text-muted-foreground">Hall Points:</span> <strong>{selectedCCA.hall_points}</strong></div>
                  <div><span className="text-muted-foreground">Beginner Friendly:</span> <strong>{selectedCCA.is_beginner_friendly ? "Yes" : "No"}</strong></div>
                  {selectedCCA.training_days && (
                    <div><span className="text-muted-foreground">Training Days:</span> <strong>{selectedCCA.training_days.join(", ")}</strong></div>
                  )}
                  {selectedCCA.training_time && (
                    <div><span className="text-muted-foreground">Training Time:</span> <strong>{selectedCCA.training_time}</strong></div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedCCA.tags?.map((tag) => (
                    <Badge key={tag} className="font-montserrat">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedCCAsPage;

// MatchMePage - Tinder-style CCA swiping interface
import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Bookmark, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

// Tinder-style CCA matching page
const MatchMePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch all CCAs
  const { data: ccas, isLoading } = useQuery({
    queryKey: ["matchme-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's wishlist to filter out already-saved CCAs
  const { data: wishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cca_wishlist").select("cca_id").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((w) => w.cca_id);
    },
    enabled: !!user,
  });

  // Save CCA to wishlist
  const saveMutation = useMutation({
    mutationFn: async (ccaId: string) => {
      await supabase.from("cca_wishlist").insert({ cca_id: ccaId, user_id: user!.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "CCA saved to wishlist! 🎉" });
    },
  });

  // Filter out already-wishlisted CCAs
  const availableCCAs = ccas?.filter((cca) => !wishlist?.includes(cca.id)) || [];
  const currentCCA = availableCCAs[currentIndex];

  // Handle swipe action
  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!currentCCA) return;
    setSwipeDirection(direction);
    setExpanded(false);

    setTimeout(() => {
      if (direction === "right" && user) {
        saveMutation.mutate(currentCCA.id);
      }
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 400);
  }, [currentCCA, user, saveMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {currentCCA ? (
          <>
            {/* CCA Card */}
            <div
              className={`w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden transition-all ${
                swipeDirection === "left" ? "animate-swipe-left" :
                swipeDirection === "right" ? "animate-swipe-right" : ""
              }`}
            >
              {/* Card image */}
              <div className="relative h-72 bg-gradient-to-br from-primary to-navy-light">
                {currentCCA.image_url ? (
                  <img src={currentCCA.image_url} alt={currentCCA.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-anton text-6xl text-primary-foreground/30">
                      {currentCCA.name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Overlay with name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                  <h2 className="font-anton text-3xl text-primary-foreground italic">{currentCCA.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentCCA.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="bg-card/20 text-primary-foreground border-none font-montserrat text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded info */}
              {expanded && (
                <div className="p-6 animate-fade-in">
                  <p className="text-muted-foreground font-montserrat text-sm mb-4">
                    {currentCCA.about || currentCCA.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {currentCCA.weekly_commitment && (
                      <div>
                        <p className="text-xs text-muted-foreground">Commitment</p>
                        <p className="font-semibold">{currentCCA.weekly_commitment}</p>
                      </div>
                    )}
                    {currentCCA.hall_points !== null && currentCCA.hall_points > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Hall Points</p>
                        <p className="font-semibold">{currentCCA.hall_points}</p>
                      </div>
                    )}
                    {currentCCA.training_days && currentCCA.training_days.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Training Days</p>
                        <p className="font-semibold">{currentCCA.training_days.join(", ")}</p>
                      </div>
                    )}
                  </div>
                  <Link to={`/cca/${currentCCA.id}`} className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full font-montserrat">
                      View Full Details
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-6 mt-8">
              {/* Skip (left swipe) */}
              <button
                onClick={() => handleSwipe("left")}
                className="w-14 h-14 rounded-full bg-card shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-muted"
              >
                <X className="h-7 w-7 text-muted-foreground" />
              </button>

              {/* More info toggle */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-16 h-16 rounded-full bg-accent shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                {expanded ? (
                  <ChevronUp className="h-8 w-8 text-accent-foreground" />
                ) : (
                  <Info className="h-8 w-8 text-accent-foreground" />
                )}
              </button>

              {/* Save (right swipe) */}
              <button
                onClick={() => handleSwipe("right")}
                className="w-14 h-14 rounded-full bg-card shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-muted"
              >
                <Bookmark className="h-7 w-7 text-primary" />
              </button>
            </div>

            {/* Progress indicator */}
            <p className="text-primary-foreground/50 text-sm font-montserrat mt-4">
              {currentIndex + 1} / {availableCCAs.length}
            </p>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-anton text-3xl text-primary-foreground mb-4">
              You've seen all CCAs! 🎉
            </h2>
            <p className="text-primary-foreground/70 font-montserrat mb-6">
              Check your saved CCAs or explore the wiki.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/saved">
                <Button variant="gold">View Saved CCAs</Button>
              </Link>
              <Link to="/explore">
                <Button variant="accent">Explore All</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchMePage;

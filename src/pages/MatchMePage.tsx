// MatchMePage - Tinder-style CCA swiping interface
import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Bookmark, Info } from "lucide-react";
import { Link } from "react-router-dom";

// Tinder-style CCA matching page
const MatchMePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

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
  const categoryTags = currentCCA
    ? parseTagField((currentCCA as typeof currentCCA & { category_tags?: string[] | string | null }).category_tags)
    : [];
  const hallPointsTag = currentCCA?.hall_points !== null && currentCCA?.hall_points !== undefined
    ? `${currentCCA.hall_points} Hall Points`
    : null;
  const commitmentTag = currentCCA?.weekly_commitment || null;

  // Handle swipe action
  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!currentCCA) return;
    setSwipeDirection(direction);

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
    <div className="h-[calc(100vh-78px)] overflow-hidden bg-primary">
      <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-2">
        {currentCCA ? (
          <>
            {/* CCA Card */}
            <div
              className={`w-[95vw] md:w-[65vw] max-w-[1200px] bg-card rounded-2xl shadow-2xl overflow-hidden transition-all ${
                swipeDirection === "left" ? "animate-swipe-left" :
                swipeDirection === "right" ? "animate-swipe-right" : ""
              }`}
            >
              {/* Card image */}
              <div className="relative h-[60vh] min-h-[420px] bg-gradient-to-br from-primary to-navy-light">
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
                  <h2 className="font-anton text-[40px] leading-none text-[#FFDD00]">{currentCCA.name}</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {categoryTags.map((tag) => (
                      <Badge key={tag} className="border-none bg-[rgba(24,28,98,0.85)] px-4 py-1 font-montserrat text-[16px] font-semibold text-white">
                        {tag}
                      </Badge>
                    ))}
                    {hallPointsTag && (
                      <Badge className="border-none bg-[rgba(24,28,98,0.85)] px-4 py-1 font-montserrat text-[16px] font-semibold text-white">
                        {hallPointsTag}
                      </Badge>
                    )}
                    {commitmentTag && (
                      <Badge className="border-none bg-[rgba(24,28,98,0.85)] px-4 py-1 font-montserrat text-[16px] font-semibold text-white">
                        {commitmentTag}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-6">
              {/* Skip (left swipe) */}
              <button
                onClick={() => handleSwipe("left")}
                className="w-14 h-14 rounded-full bg-card shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-muted"
              >
                <X className="h-7 w-7 text-muted-foreground" />
              </button>

              {/* More info toggle */}
              <Link to={`/cca/${currentCCA.id}`}>
                <button
                  className="w-16 h-16 rounded-full bg-accent shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Info className="h-8 w-8 text-accent-foreground" />
                </button>
              </Link>

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

// CCADetailPage - Full CCA information page with reviews
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, ArrowLeft, Star } from "lucide-react";

// CCA detail page showing all information and reviews
const CCADetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch CCA details
  const { data: cca, isLoading } = useQuery({
    queryKey: ["cca", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch reviews for this CCA
  const { data: reviews } = useQuery({
    queryKey: ["cca-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cca_reviews").select("*").eq("cca_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if CCA is in wishlist
  const { data: isWishlisted } = useQuery({
    queryKey: ["wishlist-check", id],
    queryFn: async () => {
      const { data } = await supabase.from("cca_wishlist").select("id").eq("cca_id", id!).eq("user_id", user!.id).maybeSingle();
      return !!data;
    },
    enabled: !!id && !!user,
  });

  // Toggle wishlist mutation
  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await supabase.from("cca_wishlist").delete().eq("cca_id", id!).eq("user_id", user!.id);
      } else {
        await supabase.from("cca_wishlist").insert({ cca_id: id!, user_id: user!.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-check", id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: isWishlisted ? "Removed from saved" : "Saved to wishlist!" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!cca) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">CCA not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative bg-primary h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto">
          <h1 className="font-anton text-4xl md:text-5xl text-primary-foreground italic mb-2">{cca.name}</h1>
          <p className="text-primary-foreground/80 font-montserrat mb-4">{cca.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {cca.tags?.map((tag) => (
              <Badge key={tag} className="bg-card/20 text-primary-foreground border-none font-montserrat">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-3">
            {user && (
              <Button
                variant={isWishlisted ? "gold" : "accent"}
                onClick={() => toggleWishlist.mutate()}
              >
                <Bookmark className="h-4 w-4" />
                {isWishlisted ? "Saved" : "Save"}
              </Button>
            )}
            <Link to="/matchme">
              <Button variant="navy-outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to MatchMe
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* About section */}
        <div className="bg-card rounded-xl p-6 shadow-md mb-8">
          <h2 className="font-anton text-2xl text-foreground mb-4">About Us</h2>
          <p className="text-muted-foreground font-montserrat leading-relaxed">
            {cca.about || cca.description}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {cca.weekly_commitment && (
              <div>
                <p className="text-xs text-muted-foreground font-montserrat">Weekly Commitment</p>
                <p className="font-montserrat font-semibold text-foreground">{cca.weekly_commitment}</p>
              </div>
            )}
            {cca.hall_points !== null && cca.hall_points > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-montserrat">Hall Points</p>
                <p className="font-montserrat font-semibold text-foreground">{cca.hall_points}</p>
              </div>
            )}
            {cca.training_days && cca.training_days.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-montserrat">Training Days</p>
                <p className="font-montserrat font-semibold text-foreground">{cca.training_days.join(", ")}</p>
              </div>
            )}
            {cca.training_time && (
              <div>
                <p className="text-xs text-muted-foreground font-montserrat">Training Time</p>
                <p className="font-montserrat font-semibold text-foreground">{cca.training_time}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <h2 className="font-anton text-2xl text-foreground mb-6">
            Hear From Our Seniors & Ex-Members
          </h2>
          {reviews && reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-secondary rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-anton">
                      {review.reviewer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-montserrat font-semibold text-accent">{review.reviewer_name}</p>
                      <p className="text-xs text-muted-foreground font-montserrat">
                        {review.reviewer_role}{review.year ? ` • ${review.year}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-montserrat italic">"{review.comment}"</p>
                  {review.rating && (
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground font-montserrat">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCADetailPage;

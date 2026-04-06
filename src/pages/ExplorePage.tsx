// ExplorePage - CCA Wiki with grid display and category filters
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import CCACard from "@/components/CCACard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const categories = ["All", "Performance & Creativity", "Competition & Academics", "Community & Lifestyle", "Cultural", "Sports"];

// CCA exploration page with search and category filters
const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-4xl text-primary-foreground mb-4">Explore CCAs</h1>
          <p className="text-primary-foreground/70 font-montserrat mb-6">
            Browse through NTU's diverse range of Co-Curricular Activities
          </p>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search CCAs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "accent" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat)}
              className="font-montserrat"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* CCA Grid - 3 columns */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-montserrat mb-4">
              Showing {filteredCCAs?.length || 0} CCAs
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCCAs?.map((cca) => (
                <CCACard key={cca.id} cca={cca} />
              ))}
            </div>
            {filteredCCAs?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-montserrat">No CCAs found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

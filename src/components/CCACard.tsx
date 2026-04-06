// CCACard - Small card component for displaying CCA summary in grids
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface CCACardProps {
  cca: Tables<"ccas">;
}

// Compact CCA card for grid display
const CCACard: React.FC<CCACardProps> = ({ cca }) => {
  return (
    <Link to={`/cca/${cca.id}`} className="group block">
      <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="h-40 bg-primary relative overflow-hidden">
          {cca.image_url ? (
            <img src={cca.image_url} alt={cca.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-navy-light">
              <span className="font-anton text-3xl text-primary-foreground opacity-50">
                {cca.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Category overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent p-3">
            <h3 className="font-anton text-lg text-primary-foreground leading-tight">{cca.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-sm text-muted-foreground line-clamp-2 font-montserrat mb-2">
            {cca.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {cca.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CCACard;

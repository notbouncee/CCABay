import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Users, Building, Trophy, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const CATEGORY_IMAGES = {
  academics: "https://www.figma.com/api/mcp/asset/2c3e9a1c-e232-4ac4-8a30-818feb7d6bf0",
  creativity: "https://www.figma.com/api/mcp/asset/1d7f7471-0ea2-4995-a78c-1faaf080dadc",
  community: "https://www.figma.com/api/mcp/asset/4e04085c-6f57-4698-a2c5-cce9544ea09b",
};

const formatEventDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const HomeCcaCard: React.FC<{ cca: Tables<"ccas"> }> = ({ cca }) => {
  return (
    <Link to={`/cca/${cca.id}`} className="group block">
      <article className="rounded-xl bg-white p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative mb-2 h-24 overflow-hidden rounded-lg bg-primary/10">
          {cca.image_url ? (
            <img src={cca.image_url} alt={cca.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-navy-light">
              <span className="font-anton text-2xl tracking-wide text-primary-foreground/85">{cca.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <h3 className="line-clamp-1 text-sm font-bold text-primary">{cca.name}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{cca.description || "Discover this CCA."}</p>

        <div className="mt-2 flex items-center justify-between rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
          <span>{cca.weekly_commitment || "3 hrs/week"}</span>
          <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-primary">{cca.category}</span>
        </div>
      </article>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const { data: featuredCCAs } = useQuery({
    queryKey: ["featured-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("*").limit(6);
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    {
      name: "Competition & Academics",
      query: "Competition & Academics",
      image: CATEGORY_IMAGES.academics,
    },
    {
      name: "Performance & Creativity",
      query: "Performance & Creativity",
      image: CATEGORY_IMAGES.creativity,
    },
    {
      name: "Community & Lifestyle",
      query: "Community & Lifestyle",
      image: CATEGORY_IMAGES.community,
    },
  ];

  const fairItems = [
    {
      date: "2026-08-10",
      time: "10AM",
      location: "SRC,\nSpine",
      featured: "Contemp{minated}",
    },
    {
      date: "2026-08-12",
      time: "11AM",
      location: "TAM\nConcourse",
      featured: "AIAA",
    },
    {
      date: "2026-08-14",
      time: "2PM",
      location: "North\nSpine",
      featured: "Debating Society",
    },
  ];

  const trendPills = [
    "Basketball",
    "CAC",
    "Contemp{minated}",
    "Debate",
    "Volleyball",
    "Earthlink",
    "Open Source",
    "Entrepreneurship",
    "Dance",
    "Film",
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-primary px-4 py-14 md:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-2 text-[52px] tracking-[0.33em] text-white md:text-[78px]">DISCOVER</h1>
          <p className="mb-6 text-sm text-white/90 md:text-base">Find your perfect Co-Curricular Activity at NTU</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/explore">
              <Button variant="accent" size="sm" className="rounded-full px-6 text-xs font-semibold uppercase tracking-wide">
                <Search className="h-4 w-4" />
                Explore CCAs
              </Button>
            </Link>
            <Link to="/matchme">
              <Button variant="gold" size="sm" className="rounded-full px-6 text-xs font-semibold uppercase tracking-wide">
                MatchMe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.25fr_1fr]">
        <div>
          <h2 className="text-[34px] text-primary">FIND YOUR MATCH HERE!</h2>
          <p className="mt-2 max-w-xl text-sm text-foreground/85">
            Join the right CCA for you! Browse all the awesome clubs, swipe to find matches,
            and read real reviews from current and past members.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">200+</p>
              <p className="text-[11px] leading-tight text-muted-foreground">CCAs & Student Interest Clubs</p>
            </div>
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">23</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Halls with Diverse CCAs</p>
            </div>
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">41</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Varsity Teams to Discover</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/explore?category=${encodeURIComponent(cat.query)}`} className="block">
              <div className="group relative h-24 overflow-hidden rounded-2xl bg-black shadow-sm transition hover:shadow-md">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover opacity-80 transition duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-black/20" />
                <p className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-gold">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-4xl italic text-accent">{user ? "Recommended For You" : "Featured CCAs"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCCAs?.map((cca) => (
              <HomeCcaCard key={cca.id} cca={cca} />
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link to="/explore">
              <Button variant="gold" size="sm" className="rounded-full px-8 text-xs font-semibold uppercase tracking-wide">
                View All CCAs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-3xl text-primary">CCA FAIR UPDATES</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_1.3fr]">
          {fairItems.map((item) => (
            <div key={item.featured} className="rounded-lg border border-border bg-white p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                <CalendarDays className="h-4 w-4" />
                {formatEventDate(item.date)}
              </div>

              <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {item.time}
              </div>

              <div className="mb-2 flex items-center gap-2 whitespace-pre-line text-[11px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {item.location}
              </div>

              <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{item.featured}</div>
            </div>
          ))}

          <div className="flex items-center rounded-lg bg-primary px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-white/75" />
            <Input
              placeholder="Search For CCAs"
              className="h-9 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/70 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-primary">CCAs Present Today</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {trendPills.map((name, idx) => (
              <button
                key={`${name}-${idx}`}
                type="button"
                className={`rounded-full px-4 py-2 text-center text-xs font-bold transition ${
                  idx % 2 === 0
                    ? "bg-gold text-primary hover:brightness-95"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

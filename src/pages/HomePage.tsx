import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bookmark } from "lucide-react";
import CCACard from "@/components/CCACard";

const CATEGORY_IMAGES = {
  academics: "/images/compAcad.png",
  creativity: "/images/perfCreate.png",
  community: "/images/commLifestyle.png",
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

const FeaturedStaticCard: React.FC<{
  isLoggedIn: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}> = ({ isLoggedIn, isSaved = false, onToggleSave }) => {
  const navigate = useNavigate();
  const [localSaved, setLocalSaved] = useState(isSaved);

  const handleCardSelect = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/cca/fallback-contemp");
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setLocalSaved(!localSaved);
    if (onToggleSave) {
      onToggleSave();
    }
  };

  return (
    <button type="button" onClick={handleCardSelect} className="group block w-full min-w-0 text-left">
      <article className="flex aspect-[432/250] w-full flex-col overflow-hidden rounded-[20px] bg-[#ECECEC] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-[60%] overflow-hidden">
          <img src="/images/contemp.png" alt="Contemp{minated}" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_28%,rgba(0,0,0,0.28)_72%,rgba(0,0,0,0.46)_100%)]" />
          <button
            type="button"
            aria-label={localSaved ? "Saved CCA" : "Save CCA"}
            onClick={handleSaveClick}
            className="group absolute right-[clamp(6px,1vw,12px)] top-[clamp(6px,1vw,12px)] flex h-[clamp(16px,2vw,32px)] w-[clamp(16px,2vw,32px)] items-center justify-center rounded-md"
          >
            <Bookmark className={`h-full w-full ${localSaved ? "fill-[#FFD000] text-[#FFD000]" : "text-white"}`} />
          </button>
          <h3 className="absolute bottom-[clamp(6px,1vw,12px)] left-[clamp(8px,1.2vw,16px)] font-anton text-[clamp(14px,2.2vw,24px)] leading-none text-white">Contemp{"{"}minated{"}"}</h3>
        </div>

        <p className="line-clamp-2 px-[clamp(8px,1.4vw,24px)] pt-[clamp(4px,0.9vw,16px)] font-montserrat text-[clamp(9px,1.05vw,14px)] font-normal leading-[1.25] text-[#8C8C8C]">
          Express yourself through contemporary dance, performance, and team spirit.
        </p>

        <div className="mt-[14px] px-[clamp(8px,1.4vw,24px)] pb-[clamp(6px,1vw,16px)]">
          <div className="flex items-center gap-[14px]">
            <span className="flex h-[clamp(14px,1.35vw,24px)] w-[clamp(84px,33%,144px)] items-center justify-center rounded-full bg-[#989DED] font-montserrat text-[clamp(7px,0.75vw,10px)] font-bold text-[#FFFFFF]">
              CATEGORY 1
            </span>
            <span className="flex h-[clamp(14px,1.35vw,24px)] w-[clamp(84px,33%,144px)] items-center justify-center rounded-full bg-[rgba(24,28,98,0.67)] font-montserrat text-[clamp(7px,0.75vw,10px)] font-bold text-[#FFFFFF]">
              CATEGORY 2
            </span>
          </div>
        </div>
      </article>
    </button>
  );
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatOption, setSelectedChatOption] = useState<string | null>(null);
  const [showRecommendedReply, setShowRecommendedReply] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [showMoreCCAs, setShowMoreCCAs] = useState(false);
  const [fairSearchQuery, setFairSearchQuery] = useState("");
  const [submittedFairSearchQuery, setSubmittedFairSearchQuery] = useState("");

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

  // Fetch real CCAs for featured section
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
  const primaryPills = trendPills.slice(0, 5);
  const expandedPillRows = [
    primaryPills,
    primaryPills,
    primaryPills,
    [primaryPills[0]],
  ];
  const chatOptions = [
    "Recommend CCAs for me",
    "Find CCAs based on my schedule",
    "Show low-commitment CCAs",
    "Help me explore by interest",
  ];
  const recommendedCcaReply =
    "Great choice! I can recommend CCAs for you. Share your interests, preferred commitment level, and available days, and I will suggest your best matches.";
  const isContempSearch = submittedFairSearchQuery.trim().toLowerCase() === "contemp{minated}";

  useEffect(() => {
    if (selectedChatOption === "Recommend CCAs for me") {
      setShowRecommendedReply(false);
      const timer = window.setTimeout(() => {
        setShowRecommendedReply(true);
      }, 650);

      return () => window.clearTimeout(timer);
    }

    setShowRecommendedReply(false);
  }, [selectedChatOption]);

  const handleSendMessage = () => {
    const trimmedMessage = chatDraft.trim();
    if (!trimmedMessage) return;

    setSentMessages((prev) => [...prev, trimmedMessage]);
    setChatDraft("");
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#181C62] px-4">
        <div className="mx-auto flex h-[450px] max-w-6xl flex-col items-center justify-center text-center">
          <h1 className="mb-3 font-anton text-[64px] leading-none tracking-[0.18em] text-white md:text-[128px]">DISCOVER</h1>
          <p className="mb-8 font-montserrat text-[24px] font-normal text-white">
            Find Your Perfect Co-Curricular Activity at NTU
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/explore"
              className="flex h-[54px] w-[270px] items-center justify-center gap-3 rounded-[20px] bg-[#D71440] font-montserrat text-[20px] font-semibold text-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="h-7 w-7 bg-[#FFFFFF]"
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
              Explore CCAs
            </Link>

            <Link
              to="/matchme"
              className="flex h-[54px] w-[224px] items-center justify-center gap-3 rounded-[20px] bg-[#FFDD00] font-montserrat text-[20px] font-semibold text-[#181C62] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="h-6 w-6 bg-[#181C62]"
                style={{
                  WebkitMaskImage: "url('/icons/matchme.png')",
                  maskImage: "url('/icons/matchme.png')",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
              />
              MatchMe
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid gap-8 px-4 py-10 md:px-[180px] md:grid-cols-[1.25fr_1fr]">
        <div className="flex h-[480px] flex-col justify-center">
          <h2 className="font-anton text-[40px] text-primary">FIND YOUR MATCH HERE!</h2>
          <p className="mt-2 w-full max-w-[412px] font-montserrat text-[16px] font-normal text-[#000000]">
            Join the right CCA for you! Browse all the awesome clubs, swipe to find matches,
            and read real reviews from current and past members.
          </p>

          <div className="mt-[50px] grid w-full max-w-[412px] grid-cols-3 gap-4 text-center">
            <div>
              <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#181C62]">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white">
                  <img src="/icons/club.png" alt="Club" className="h-[30px] w-[30px] object-contain" />
                </div>
              </div>
              <p className="mt-2 font-montserrat text-[18px] font-bold text-[#000000]">200+</p>
              <p className="font-montserrat text-[14px] font-normal leading-tight text-[#000000]">CCAs & Student Interest Clubs</p>
            </div>
            <div>
              <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#181C62]">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white">
                  <img src="/icons/home.png" alt="Home" className="h-[26px] w-[26px] object-contain" />
                </div>
              </div>
              <p className="mt-2 font-montserrat text-[18px] font-bold text-[#000000]">23</p>
              <p className="font-montserrat text-[14px] font-normal leading-tight text-[#000000]">Halls with Diverse CCAs</p>
            </div>
            <div>
              <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#181C62]">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white">
                  <img src="/icons/trophy.png" alt="Trophy" className="h-[26px] w-[26px] object-contain" />
                </div>
              </div>
              <p className="mt-2 font-montserrat text-[18px] font-bold text-[#000000]">41</p>
              <p className="font-montserrat text-[14px] font-normal leading-tight text-[#000000]">Varsity Teams to Discover</p>
            </div>
          </div>
        </div>

        <div className="flex h-[480px] flex-col justify-center space-y-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/explore?category=${encodeURIComponent(cat.query)}`}
              className="block w-full max-w-[469px]"
            >
              <div className="group relative h-[128px] overflow-hidden rounded-2xl bg-black shadow-sm transition hover:shadow-md">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25" />
                <p className="absolute inset-0 flex items-center justify-center px-4 text-center font-anton text-[34px] leading-none text-[#FFDD00]">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary py-10 md:py-12">
        <div className="w-full px-6 md:px-10 lg:px-12">
          <h2 className="mb-6 font-anton text-[clamp(30px,3.2vw,50px)] text-accent">{user ? "Recommended For You" : "Featured CCAs"}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCCAs?.map((cca) => (
              <CCACard
                key={cca.id}
                cca={cca}
                isSaved={wishlistIds?.includes(cca.id) || false}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link to="/explore">
              <Button
                variant="gold"
                className="h-[clamp(36px,3.8vw,50px)] w-[clamp(150px,17vw,220px)] rounded-full font-montserrat text-[clamp(11px,1.1vw,16px)] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
              >
                View All CCAs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-8 md:px-10 lg:px-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="shrink-0 font-anton text-[clamp(28px,3.1vw,40px)] text-[#181C62]">CCA FAIR UPDATES</h2>
          <div className="h-[3px] flex-1 bg-[#181C62]" />
        </div>

        <div className="flex items-center gap-10">
          <div className="flex items-center gap-5">
          <div className="flex h-[clamp(132px,13.8vw,189px)] w-[clamp(130px,13.5vw,185px)] flex-col rounded-xl border-2 border-[#181C62] bg-white px-3 pb-2 pt-3">
            <div className="mb-1 flex items-center gap-1.5 font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold text-[#181C62]">
              <img src="/icons/dates.png" alt="Dates" className="h-[clamp(20px,2.2vw,30px)] w-[clamp(20px,2.2vw,30px)] object-contain" />
              Dates
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">
                {isContempSearch ? "11 to 12" : "11 to 13"}
              </p>
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">August</p>
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">2026</p>
            </div>
          </div>

          <div className="flex h-[clamp(132px,13.8vw,189px)] w-[clamp(130px,13.5vw,185px)] flex-col rounded-xl border-2 border-[#181C62] bg-white px-3 pb-2 pt-3">
            <div className="mb-1 flex items-center gap-1.5 font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold text-[#181C62]">
              <img src="/icons/timing.png" alt="Timing" className="h-[clamp(20px,2.2vw,30px)] w-[clamp(20px,2.2vw,30px)] object-contain" />
              Timing
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">
                {isContempSearch ? "11AM" : "10AM"}
              </p>
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">to</p>
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">5PM</p>
            </div>
          </div>

          <div className="flex h-[clamp(132px,13.8vw,189px)] w-[clamp(130px,13.5vw,185px)] flex-col rounded-xl border-2 border-[#181C62] bg-white px-3 pb-2 pt-3">
            <div className="mb-1 flex items-center gap-1.5 font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold text-[#181C62]">
              <img src="/icons/location.png" alt="Location" className="h-[clamp(20px,2.2vw,30px)] w-[clamp(20px,2.2vw,30px)] object-contain" />
              Location
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">
                {isContempSearch ? "AIA" : "North"}
              </p>
              <p className="text-center font-montserrat text-[clamp(16px,1.9vw,26px)] font-bold leading-tight text-[#181C62]">
                {isContempSearch ? "Canopy" : "Spine"}
              </p>
            </div>
          </div>
          </div>

          <div className="flex h-[clamp(46px,4.9vw,72px)] w-[clamp(360px,51.3vw,700px)] min-w-0 items-center rounded-xl bg-primary px-5 py-2">
            <img src="/icons/search.png" alt="Search" className="mr-3 h-[clamp(16px,1.8vw,24px)] w-[clamp(16px,1.8vw,24px)] object-contain" />
            <Input
              placeholder="Search For CCAs"
              value={fairSearchQuery}
              onChange={(e) => setFairSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSubmittedFairSearchQuery(fairSearchQuery);
                }
              }}
              className="h-full border-0 bg-transparent px-0 font-montserrat [--fair-search-size:clamp(11px,1.25vw,17px)] text-[length:var(--fair-search-size)] font-bold leading-tight text-white placeholder:text-[length:var(--fair-search-size)] placeholder:font-bold placeholder:leading-tight placeholder:text-white focus:placeholder:text-[#8C8C8C] focus:border-transparent focus:outline-none focus:shadow-none focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 font-montserrat text-[clamp(18px,2.05vw,28px)] font-bold text-primary">CCAs Present Today</p>
          <div className={showMoreCCAs ? "w-full space-y-3" : "flex flex-wrap items-center justify-start gap-4"}>
            {!showMoreCCAs && (
              <>
                {trendPills.slice(0, 4).map((name, idx) => (
                  <button
                    key={`${name}-${idx}`}
                    type="button"
                    className="h-[clamp(34px,3.35vw,46px)] w-[clamp(188px,18.4vw,252px)] rounded-full bg-[#FFDD00] text-center font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold text-primary transition hover:brightness-95"
                  >
                    {name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowMoreCCAs(true)}
                  className="h-[clamp(34px,3.35vw,46px)] w-[clamp(110px,10.8vw,148px)] rounded-full bg-primary text-center font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold text-white transition-colors duration-150 hover:bg-[#4C53C7] hover:text-[#FFDD00]"
                >
                  +12 More
                </button>
              </>
            )}

            {showMoreCCAs &&
              expandedPillRows.map((row, rowIdx) => (
                <div key={`expanded-row-${rowIdx}`} className="grid w-full grid-cols-5 gap-4">
                  {row.map((name, pillIdx) => (
                    <button
                      key={`expanded-${rowIdx}-${pillIdx}-${name}`}
                      type="button"
                      className={`h-[clamp(34px,3.35vw,46px)] w-full rounded-full text-center font-montserrat text-[clamp(12px,1.35vw,18px)] font-bold transition ${
                        rowIdx % 2 === 0
                          ? "bg-[#FFDD00] text-primary hover:brightness-95"
                          : "bg-[#8C8C8C] text-white hover:brightness-95"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </section>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 h-[644px] w-[408px] overflow-hidden rounded-2xl bg-[#E6E6E6] shadow-[0_0_10px_0_rgba(0,0,0,0.25)]">
          <div className="relative flex h-[56px] items-center justify-center bg-[#D71440]">
            <span className="font-anton text-[24px] leading-none text-white">CCAi</span>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsChatOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-110 active:scale-95"
            >
              <img src="/icons/closeBot.png" alt="Close chat" className="h-8 w-8 object-contain" />
            </button>
          </div>

          <div className="flex h-[calc(100%-56px)] flex-col p-3">
            <div className="h-[71px] w-[304px] rounded-[24px] rounded-bl-[8px] bg-white p-[14px] font-montserrat text-[12px] leading-[1.25] text-[#3F3F3F]">
              Hi, I'm CCAI ("<strong>Kai</strong>") 👋
              <br />
              Tell me what you're looking for, and I'll help you find CCAs that fit you.
            </div>

            <div className="mt-3 w-fit max-w-[72%] rounded-[24px] rounded-bl-[8px] bg-white px-[14px] py-[14px] font-montserrat text-[12px] leading-[1.25] text-[#3F3F3F]">
              What can I help you with today?
            </div>

            <div className={`${selectedChatOption ? "mt-3" : "mt-auto"} space-y-2 pb-2`}>
              {(selectedChatOption ? [selectedChatOption] : chatOptions).map((option) => {
                const isSelected = selectedChatOption === option;

                return (
                  <div key={option} className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedChatOption(option)}
                      className={`rounded-[24px] rounded-br-[8px] px-[14px] py-[14px] font-montserrat text-[12px] leading-[1.25] transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#D71440] font-bold text-white"
                          : "border border-dashed border-black bg-transparent font-normal text-[#3F3F3F] hover:border-white hover:bg-[#D71440] hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  </div>
                );
              })}

              {showRecommendedReply && (
                <div className="pt-1">
                  <div className="w-[304px] rounded-[24px] rounded-bl-[8px] bg-white px-[14px] py-[14px] font-montserrat text-[12px] leading-[1.25] text-[#3F3F3F]">
                    {recommendedCcaReply}
                  </div>
                </div>
              )}

              {sentMessages.map((message, index) => (
                <div key={`sent-msg-${index}`} className="flex justify-end pt-1">
                  <div className="max-w-[72%] rounded-[24px] rounded-br-[8px] bg-[#D71440] px-[14px] py-[14px] font-montserrat text-[12px] font-normal leading-[1.25] text-white">
                    {message}
                  </div>
                </div>
              ))}
            </div>

            <div className={`${selectedChatOption ? "mt-auto" : "mt-1"} flex h-[54px] w-full items-center rounded-full bg-black pl-5 pr-3`}>
              <Input
                placeholder="Type your message here..."
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="h-full border-0 bg-transparent px-0 font-montserrat text-[14px] font-medium leading-[1.25] text-white placeholder:text-[14px] placeholder:font-medium placeholder:leading-[1.25] placeholder:text-white focus:placeholder:text-[#8C8C8C] focus:border-transparent focus:outline-none focus:shadow-none focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="button"
                aria-label="Send message"
                onClick={handleSendMessage}
                className="group ml-auto flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white transition-colors duration-150 hover:bg-[#D71440]"
              >
                <img
                  src="/icons/sendIcon.png"
                  alt="Send message"
                  className="h-[22px] w-[22px] object-contain transition-[filter] duration-150 group-hover:[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(162deg)_brightness(102%)_contrast(101%)]"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <button
          type="button"
          aria-label="Chatbot"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#D71440] transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <img src="/icons/chatbot.png" alt="Chatbot" className="h-[40px] w-[40px] object-contain" />
        </button>
      )}
    </div>
  );
};

export default HomePage;

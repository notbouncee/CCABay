// CCACard - Styled card for Explore grid with image, tags, and quick metadata
import React from "react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { Star, Bookmark } from "lucide-react";

interface CCACardProps {
  cca: Tables<"ccas">;
  isSaved?: boolean;
  onToggleSave?: (ccaId: string) => void;
  isClickable?: boolean;
}

const CCACard: React.FC<CCACardProps> = ({ cca, isSaved = false, onToggleSave, isClickable = true }) => {
  const parseCategoryTags = () => {
    const rawCategoryTags = (cca as Tables<"ccas"> & { category_tags?: string[] | string | null }).category_tags;

    if (Array.isArray(rawCategoryTags)) {
      return rawCategoryTags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
    }

    if (typeof rawCategoryTags === "string") {
      try {
        const parsed = JSON.parse(rawCategoryTags);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const categoryTags = parseCategoryTags();
  const dbTags = (cca.tags ?? []).filter(Boolean);
  const primaryTag = categoryTags[0] || dbTags[0] || cca.category;
  const secondaryTag = categoryTags[1] || dbTags[1] || cca.category;

  const parseOtherTags = () => {
    const rawOtherTags = (cca as Tables<"ccas"> & { other_tags?: string[] | string | null }).other_tags;

    if (Array.isArray(rawOtherTags)) {
      return rawOtherTags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
    }

    if (typeof rawOtherTags === "string") {
      try {
        const parsed = JSON.parse(rawOtherTags);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const otherTags = parseOtherTags();
  const isApplicationClosed = otherTags.some((tag) => tag.trim().toLowerCase() === "closed");
  const isClosingSoon = otherTags.some((tag) => tag.trim().toLowerCase() === "closing soon");
  const commitment = cca.weekly_commitment || "Medium";
  const hallPoints = cca.hall_points ?? 3;

  const formatTryoutDate = (rawDate: string | null) => {
    if (!rawDate) return "12 Aug 2026";
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return parsed.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const trialDateText = (cca as Tables<"ccas"> & { trial_date?: string | null }).trial_date;
  const trialDate = trialDateText && trialDateText.trim().length > 0
    ? trialDateText
    : formatTryoutDate(cca.tryout_dates);

  const parseDisplayDate = (rawDate: string) => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const getApplicationClosingInfo = () => {
    const referenceToday = new Date("2026-08-10T00:00:00");
    const candidateDate =
      (trialDateText && parseDisplayDate(trialDateText)) ||
      (cca.tryout_dates && parseDisplayDate(cca.tryout_dates)) ||
      (cca.audition_dates && parseDisplayDate(cca.audition_dates));

    if (!candidateDate) {
      return null;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.ceil((candidateDate.getTime() - referenceToday.getTime()) / msPerDay);
    const formattedDate = candidateDate.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      formattedDate,
      daysLeft: Math.max(diffInDays, 0),
    };
  };

  const closingInfo = isClosingSoon ? getApplicationClosingInfo() : null;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(cca.id);
    }
  };

  const cardContent = (
    <>
      <article
        className="overflow-hidden rounded-[20px] bg-white transition-all duration-200 group-hover:-translate-y-0.5 max-w-[500px] max-h-[500px] w-full h-full"
        style={{ boxShadow: "0 0 10px 0 rgba(0,0,0,0.10)" }}
      >
        <div className="relative h-[148px] overflow-hidden bg-[#E6E6E6]">
          {cca.image_url ? (
            <img src={cca.image_url} alt={cca.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-montserrat text-[12px] font-semibold text-[#8C8C8C]">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_28%,rgba(0,0,0,0.28)_72%,rgba(0,0,0,0.46)_100%)]" />
          <h3 className="absolute bottom-3 left-4 font-anton text-[24px] leading-none text-white">
            {cca.name}
          </h3>

          <button
            type="button"
            aria-label={isSaved ? "Saved" : "Save"}
            onClick={handleSaveClick}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center"
          >
            <Bookmark className={`h-8 w-8 ${isSaved ? "fill-[#FFD000] text-[#FFD000]" : "text-white"}`} />
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

          <div
            className={`mt-3 flex items-center gap-2 ${
              isApplicationClosed
                ? "text-[#8C8C8C]"
                : isClosingSoon
                  ? "text-[#23286F]"
                  : "text-primary"
            }`}
          >
            <img
              src="/icons/dates.png"
              alt="Trials"
              className={`h-4 w-4 object-contain ${isApplicationClosed ? "opacity-60" : ""}`}
            />
            {isApplicationClosed ? (
              <span className="font-montserrat text-[12px] font-bold leading-none text-[#8C8C8C]">
                Application Closed
              </span>
            ) : isClosingSoon && closingInfo ? (
              <span className="font-montserrat text-[12px] font-bold leading-none text-[#23286F]">
                {`Application Closes: ${closingInfo.formattedDate} `}
                <span className="text-[#D71440]">({closingInfo.daysLeft} {closingInfo.daysLeft === 1 ? "day" : "days"} left)</span>
              </span>
            ) : (
              <span className="font-montserrat text-[12px] font-bold leading-none">
                Trials: {trialDate}
              </span>
            )}
          </div>
        </div>
      </article>
    </>
  );

  if (isClickable) {
    return (
      <Link to={`/cca/${cca.id}`} className="group block">
        {cardContent}
      </Link>
    );
  }

  return <div className="group block">{cardContent}</div>;
};

export default CCACard;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// CCA detail page showing all information and reviews
const CCADetailPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(true);

  const tags = [
    "Performing Arts",
    "Recreational",
    "Staying Active",
    "Social Connection",
    "Team-Based",
    "Beginner-Friendly",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div
        className="relative w-full bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/images/contempGrad.png')",
          height: "clamp(280px, 35vw, 380px)",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto">
          <h1 className="font-anton text-4xl md:text-5xl text-primary-foreground mb-2">
            Contemp{"{"}minated{"}"}
          </h1>
          <p className="text-primary-foreground/80 font-montserrat mb-4">
            Express yourself through contemporary dance, performance, and team spirit.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="min-h-8 rounded-full border-none bg-[rgba(152,157,237,0.6)] px-4 py-1.5 text-[13px] font-semibold text-primary-foreground font-montserrat"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant={isSaved ? "gold" : "accent"}
              onClick={() => setIsSaved((prev) => !prev)}
              className="transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
            >
              <img
                src="/icons/saveOption.png"
                alt="Save"
                className={`h-5 w-5 object-contain ${
                  isSaved
                    ? "[filter:brightness(0)_saturate(100%)_invert(11%)_sepia(35%)_saturate(2691%)_hue-rotate(223deg)_brightness(94%)_contrast(97%)]"
                    : "[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(162deg)_brightness(102%)_contrast(101%)]"
                }`}
              />
              {isSaved ? "Saved" : "Save"}
            </Button>

            <Link to="/explore">
              <Button
                variant="navy-outline"
                className="group border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <img
                  src="/icons/backArrow.png"
                  alt="Back"
                  className="h-5 w-5 object-contain transition-[filter] duration-200 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(162deg)_brightness(102%)_contrast(101%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(11%)_sepia(35%)_saturate(2691%)_hue-rotate(223deg)_brightness(94%)_contrast(97%)]"
                />
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* About and key information sections */}
        <div className="grid gap-8 lg:grid-cols-[655px_655px] lg:justify-center">
          <div className="bg-card rounded-[28px] p-6 shadow-md lg:h-[340px] lg:w-[655px] lg:p-8">
            <h2 className="mb-4 font-anton text-[32px] leading-none text-foreground">About Us</h2>
            <p className="font-montserrat text-[16px] font-normal leading-[1.2] text-[#2B317F]">
              Are you looking for a community of passionate, well-spirited dancers to grow and express yourself with? Welcome to Contemp{"{"}minated{"}"}, NTU&apos;s very own contemporary dance club that celebrates creativity, connection, and self-expression.
            </p>

            <p className="mt-4 font-montserrat text-[16px] font-normal leading-[1.2] text-[#2B317F]">
              From our first steps into this environment, it wasn&apos;t just the movement or music that resonated with us, it was the atmosphere. There was something deeply heartwarming about being surrounded by dancers who weren&apos;t afraid to try, fail, and try again. This club has become a safe space where dancers can express themselves freely and experiment with their own styles, all while being supported by like-minded individuals.
            </p>
          </div>

          <div className="bg-card rounded-[28px] p-6 shadow-md lg:h-[340px] lg:w-[655px] lg:p-8">
            <h2 className="mb-4 font-anton text-[32px] leading-none text-foreground">Key Information</h2>

            <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
              <div className="space-y-3">
                <div className="rounded-xl bg-[#F3F3F3] p-4">
                  <div className="flex items-start gap-3">
                    <img src="/icons/dates.png" alt="Dates" className="mt-1 h-[30px] w-[30px] object-contain" />
                    <div>
                      <p className="font-montserrat text-[12px] font-semibold text-[#2B317F]">Weekly Commitment</p>
                      <p className="font-montserrat text-[15px] font-bold text-[#2B317F]">6 hrs / week</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F3F3F3] p-4">
                  <div className="flex items-start gap-3">
                    <img src="/icons/timing.png" alt="Timing" className="mt-1 h-[30px] w-[30px] object-contain" />
                    <div>
                      <p className="font-montserrat text-[12px] font-semibold text-[#2B317F]">Training Schedule</p>
                      <p className="font-montserrat text-[15px] font-bold leading-tight text-[#2B317F]">Tuesday · 1900 - 2200</p>
                      <p className="font-montserrat text-[15px] font-bold leading-tight text-[#2B317F]">Thursday · 1900 - 2200</p>
                      <p className="mt-1 font-montserrat text-[11px] font-normal text-[#7C7C7C]">Location: SBS Foyer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl bg-[rgba(152,157,237,0.2)]">
                  <div className="flex items-center gap-3 bg-[rgba(152,157,237,0.2)] px-4 py-3">
                    <Star className="h-5 w-5 fill-[#23286F] text-[#23286F]" />
                    <p className="font-montserrat text-[12px] font-semibold text-[#2B317F]">Hall Points Breakdown</p>
                  </div>

                  <div className="px-4 pb-4 pt-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 font-montserrat text-[12px] font-bold text-[#2B317F]">
                        <span>Leader</span>
                        <span className="text-[#D71440]">7 points</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 font-montserrat text-[12px] font-bold text-[#2B317F]">
                        <span>Committee Member</span>
                        <span className="text-[#D71440]">5 points</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 font-montserrat text-[12px] font-bold text-[#2B317F]">
                        <span>Active Member</span>
                        <span className="text-[#D71440]">3 points</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#DDEFD7] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <img src="/icons/CheckCircle.png" alt="Check" className="mt-1 h-5 w-5 object-contain" />
                    <div>
                      <p className="font-montserrat text-[12px] font-semibold text-[#2B317F]">Prerequisites</p>
                      <p className="font-montserrat text-[11px] font-normal leading-snug text-[#587264]">Interest and passion in learning contemporary dance.</p>
                      <p className="mt-0.5 font-montserrat text-[11px] font-normal leading-snug text-[#587264]">No prior experience required.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[621px_689px] lg:justify-center">
          <div className="bg-card rounded-[28px] p-6 shadow-md lg:h-[275px] lg:w-[621px]">
            <h2 className="font-anton text-[32px] leading-none text-foreground">Trial &amp; Recruitment</h2>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2.5">
                <div className="flex h-[36px] w-[359px] items-center justify-between rounded-xl bg-[rgba(152,157,237,0.2)] px-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/introIcon.png" alt="Intro" className="h-5 w-5 object-contain" />
                    <p className="font-montserrat text-[12px] font-bold text-[#2B317F]">Intro Session</p>
                  </div>
                  <p className="font-montserrat text-[12px] font-medium text-[#2B317F]">12 Aug (Mon) · 1900 - 2000</p>
                </div>

                <div className="w-[359px] rounded-xl bg-[rgba(152,157,237,0.2)] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src="/icons/trialIcon.png" alt="Trial" className="h-5 w-5 object-contain" />
                      <p className="font-montserrat text-[12px] font-bold text-[#2B317F]">Trial Workshop</p>
                    </div>
                    <div className="space-y-0.5 text-right font-montserrat text-[12px] font-medium text-[#2B317F]">
                      <p>13 Aug (Tue) · 1900 - 2100</p>
                      <p>14 Aug (Wed) · 1900 - 2100</p>
                      <p>15 Aug (Thu) · 1900 - 2100</p>
                    </div>
                  </div>
                </div>

                <div className="flex h-[36px] w-[359px] items-center justify-between rounded-xl bg-[rgba(152,157,237,0.2)] px-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/deadlineIcon.png" alt="Deadline" className="h-5 w-5 object-contain" />
                    <p className="font-montserrat text-[12px] font-bold text-[#2B317F]">Sign-Up Deadline</p>
                  </div>
                  <p className="font-montserrat text-[12px] font-medium text-[#2B317F]">16 Aug (Fri) · 2359</p>
                </div>
              </div>

              <div className="hidden h-[160px] w-px bg-[#2B317F] md:block" />

              <div className="w-[162px]">
                <div className="space-y-3">
                  <Button className="h-[36px] w-[162px] justify-center bg-[#FFDD00] px-0 font-montserrat text-[12px] font-bold text-[#1F255F] hover:bg-[#F2D200]">
                    <img src="/icons/TelegramLogo.png" alt="Telegram" className="h-5 w-5 object-contain" />
                    Apply for Trial
                  </Button>
                  <Button className="h-[36px] w-[162px] justify-start bg-[#FFDD00] pl-7 pr-0 font-montserrat text-[12px] font-bold text-[#1F255F] hover:bg-[#F2D200]">
                    <img src="/icons/signUp.png" alt="Sign Up" className="h-5 w-5 object-contain" />
                    Sign Up
                  </Button>
                </div>
                <p className="mt-4 w-[162px] text-left font-montserrat text-[12px] font-bold text-[#2B317F]">Recruitment Period:</p>
                <p className="w-[162px] text-left font-montserrat text-[12px] font-bold text-[#D71440]">5 - 16 Aug 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[28px] p-6 shadow-md lg:h-[275px] lg:w-[689px]">
            <h2 className="font-anton text-[32px] leading-none text-foreground">Gallery</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { src: "/images/ContempDetails/performanceDay.png", label: "Performance Day" },
                { src: "/images/ContempDetails/dressedRehearsal.png", label: "Dressed Rehearsal" },
                { src: "/images/ContempDetails/teamBonding.png", label: "Team Bonding" },
                { src: "/images/ContempDetails/propulsion.png", label: "Propulsion 2023" },
              ].map((item) => (
                <div key={item.label}>
                  <img
                    src={item.src}
                    alt={item.label}
                    className="mx-auto h-[144px] w-[144px] rounded-2xl object-cover"
                  />
                  <p className="mt-2 text-center font-montserrat text-[12px] font-bold text-[#2B317F]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[28px] bg-card p-6 shadow-md lg:mx-auto lg:h-[323px] lg:w-[1346px]">
          <div className="h-full">
            <h2 className="font-anton text-[32px] leading-none text-foreground">Hear From Our Members</h2>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:justify-between">
              {[
                {
                  image: "/images/ContempDetails/review1.png",
                  name: "Jordan Wang",
                  description: "Year 2",
                  review:
                    "I joined without much experience, but the seniors were patient, encouraging, and always willing to guide us. It quickly became one of the most meaningful parts of my NTU life.",
                },
                {
                  image: "/images/ContempDetails/review2.png",
                  name: "Sandra Lim",
                  description: "Former Member (Graduated)",
                  review:
                    "Those 4 years gave me some of the most memorable experiences of my university life. From the friendships to the shared milestones, it became a big part of my NTU journey.",
                },
                {
                  image: "/images/ContempDetails/review3.png",
                  name: "Chew Xuan Rei",
                  description: "Year 1",
                  review:
                    "Super welcoming and fun crew! Even as a beginner, I felt included and really enjoyed learning the routines.",
                },
              ].map((item) => (
                <article
                  key={item.name}
                  className="rounded-[24px] bg-[rgba(230,230,230,0.6)] p-6 lg:h-[208px] lg:w-[420px]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[60px] w-[60px] rounded-full object-cover"
                    />
                    <div>
                      <p className="font-anton text-[23px] leading-none text-[#23286F]">{item.name}</p>
                      <p className="mt-1 font-montserrat text-[16px] font-medium leading-tight text-[#23286F]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 font-montserrat text-[16px] font-normal leading-[1.15] text-[#23286F]">
                    “{item.review}”
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 px-6 py-4 lg:mx-auto lg:w-[1346px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
            <h2 className="shrink-0 font-anton text-[32px] leading-none text-foreground">Contact Us:</h2>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3 rounded-xl px-2 py-1 transition-all duration-200 hover:-translate-y-1 hover:opacity-70">
                <img src="/icons/InstagramLogo.png" alt="Instagram" className="h-8 w-8 object-contain" />
                <div>
                  <p className="font-montserrat text-[12px] font-bold leading-tight text-[#23286F]">Instagram</p>
                  <p className="font-montserrat text-[12px] font-medium leading-tight text-[#23286F]">@contempminated</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-2 py-1 transition-all duration-200 hover:-translate-y-1 hover:opacity-70">
                <img src="/icons/TelegramLogo.png" alt="Telegram" className="h-8 w-8 object-contain" />
                <div>
                  <p className="font-montserrat text-[12px] font-bold leading-tight text-[#23286F]">Telegram</p>
                  <p className="font-montserrat text-[12px] font-medium leading-tight text-[#23286F]">@contempminated</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-2 py-1 transition-all duration-200 hover:-translate-y-1 hover:opacity-70">
                <img src="/icons/MicrosoftOutlookLogo.png" alt="Email" className="h-8 w-8 object-contain" />
                <div>
                  <p className="font-montserrat text-[12px] font-bold leading-tight text-[#23286F]">Email</p>
                  <p className="font-montserrat text-[12px] font-medium leading-tight text-[#23286F]">@cac-contemp@e.ntu.edu.sg</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CCADetailPage;
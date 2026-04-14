import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const DEFAULT_INTERESTS = [
  "Sports",
  "Performing Arts",
  "Service",
  "Academics",
  "Arts",
  "Orientation",
  "Cultural",
  "Faith-Based",
  "Competition-Based",
  "Recreational",
];

const DEFAULT_GOALS = ["Leadership", "Networking", "Portfolio", "Skill Building", "Community"];

const PreferencePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [wantsHallPoints, setWantsHallPoints] = useState(false);
  const [hallPointsTarget, setHallPointsTarget] = useState(3);
  const [commitmentLevel, setCommitmentLevel] = useState(3);
  const [syncTimetable, setSyncTimetable] = useState(true);

  const { data: ccas = [] } = useQuery({
    queryKey: ["all-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("category,tags");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!userPreferences) return;
    setSelectedInterests(userPreferences.interest_categories ?? []);
    setSelectedGoals(userPreferences.goal_tags ?? []);
    setWantsHallPoints(userPreferences.wants_hall_points ?? false);
    setHallPointsTarget(userPreferences.hall_points_target ?? 3);
    setCommitmentLevel(userPreferences.commitment_level ?? 3);
    setSyncTimetable(userPreferences.sync_timetable ?? true);
  }, [userPreferences]);

  const availableInterests = useMemo(() => {
    const set = new Set(DEFAULT_INTERESTS);
    ccas.forEach((cca) => {
      if (cca.category) set.add(cca.category);
      (cca.tags ?? []).forEach((tag) => set.add(tag));
    });
    return Array.from(set).slice(0, 10);
  }, [ccas]);

  const availableGoals = useMemo(() => {
    const tagSet = new Set(DEFAULT_GOALS);
    ccas.forEach((cca) => {
      (cca.tags ?? []).forEach((tag) => {
        const normalized = tag.trim();
        if (normalized) tagSet.add(normalized);
      });
    });
    return Array.from(tagSet).slice(0, 8);
  }, [ccas]);

  const toggleFromList = (
    value: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  const savePreferences = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in.");
      const payload = {
        user_id: user.id,
        interest_categories: selectedInterests,
        goal_tags: selectedGoals,
        wants_hall_points: wantsHallPoints,
        hall_points_target: hallPointsTarget,
        commitment_level: commitmentLevel,
        sync_timetable: syncTimetable,
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save preferences", description: error.message, variant: "destructive" });
    },
  });

  const handleSavePreferences = async (goToMatchPage: boolean) => {
    try {
      await savePreferences.mutateAsync();
      toast({ title: "Preferences saved", description: "Saved to your profile successfully." });
      if (goToMatchPage) {
        navigate("/matchme");
      }
    } catch {
      // Error toast is handled by mutation onError.
    }
  };

  const resetPreferences = () => {
    setSelectedInterests([]);
    setSelectedGoals([]);
    setWantsHallPoints(false);
    setHallPointsTarget(3);
    setCommitmentLevel(3);
    setSyncTimetable(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <section className="bg-primary px-6 py-10 text-primary-foreground md:px-12">
        <div className="mx-auto max-w-[1320px] flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-anton text-[54px] leading-none">Ready to find "The One"?</h1>
            <p className="mt-3 max-w-3xl font-montserrat text-sm text-primary-foreground/85 md:text-base">
              Stop scrolling through endless PDFs and dead IG links. Answer a few quick questions and
              we will match you with clubs that fit your vibe, goals, and timetable.
            </p>
          </div>

          <div className="flex shrink-0 gap-3 md:flex-col">
            <Button
              className="bg-gold text-black hover:bg-gold/90"
              onClick={() => handleSavePreferences(true)}
              disabled={savePreferences.isPending}
            >
              Show Me Matches
            </Button>
            <Button variant="accent" onClick={resetPreferences}>
              Reset Preferences
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] space-y-6 px-6 py-6 md:px-12">
        <div className="rounded-2xl bg-white p-5 shadow-[0_0_10px_5px_rgba(0,0,0,0.05)]">
          <h2 className="font-anton text-4xl text-primary">What kind of CCAs are you interested in?</h2>
          <p className="mt-1 font-montserrat text-sm text-primary/75">
            Whether you want to perform, compete, give back, or try something new, pick what catches your interest.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-[#d9d9d9] p-4 md:grid-cols-5">
            {availableInterests.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleFromList(interest, selectedInterests, setSelectedInterests)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "bg-[#e6e6e6] text-[#8c8c8c]"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-[0_0_10px_5px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-anton text-4xl text-primary">Are you aiming for hall points?</h2>
                <p className="mt-1 font-montserrat text-sm text-primary/75">
                  Be honest, are hall points part of your plan?
                </p>
              </div>
              <Switch checked={wantsHallPoints} onCheckedChange={setWantsHallPoints} />
            </div>

            <p className="mt-4 font-montserrat text-sm text-primary">How many points do you want?</p>
            <input
              type="range"
              min={0}
              max={5}
              value={hallPointsTarget}
              onChange={(event) => setHallPointsTarget(Number(event.target.value))}
              className="mt-3 w-full accent-accent"
            />
            <p className="mt-1 text-right text-xs text-[#8c8c8c] font-montserrat">
              Looking for {hallPointsTarget} to 5 points
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-[0_0_10px_5px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-anton text-4xl text-primary">How much time can you commit?</h2>
                <p className="mt-1 font-montserrat text-sm text-primary/75">
                  From low to high commitment, what fits your schedule best?
                </p>
              </div>
              <Switch checked={syncTimetable} onCheckedChange={setSyncTimetable} />
            </div>

            <p className="mt-4 font-montserrat text-sm text-primary">Commitment level</p>
            <input
              type="range"
              min={1}
              max={5}
              value={commitmentLevel}
              onChange={(event) => setCommitmentLevel(Number(event.target.value))}
              className="mt-3 w-full accent-accent"
            />
            <p className="mt-1 text-right text-xs text-[#8c8c8c] font-montserrat">
              {commitmentLevel <= 2 ? "Low" : commitmentLevel <= 4 ? "Moderate" : "High"} commitment
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_0_10px_5px_rgba(0,0,0,0.05)]">
          <h2 className="font-anton text-4xl text-primary">What do you want to get out of your CCA?</h2>
          <p className="mt-1 font-montserrat text-sm text-primary/75">
            Select the things that matter most to you when joining a club.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-[#d9d9d9] p-4 md:grid-cols-4">
            {availableGoals.map((goal) => {
              const active = selectedGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleFromList(goal, selectedGoals, setSelectedGoals)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "bg-[#e6e6e6] text-[#8c8c8c]"
                  }`}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="accent"
            onClick={() => handleSavePreferences(false)}
            disabled={savePreferences.isPending}
          >
            {savePreferences.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-[0_0_10px_5px_rgba(0,0,0,0.05)]">
          <div>
            <h2 className="font-anton text-4xl text-primary">Let's make it fit your timetable!</h2>
            <p className="mt-1 font-montserrat text-sm text-primary/75">
              We can filter out CCAs that clash with your classes so everything fits your schedule.
            </p>
          </div>
          <Button variant="accent" onClick={() => navigate("/planner")}>
            Sync My NTU Timetable
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PreferencePage;

// PlannerPage - Schedule planner with timetable and CCA selection
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, AlertTriangle, Send } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 0800 to 2300

// Helper to convert time string to hour number
const timeToHour = (time: string): number => {
  const [h] = time.split(":").map(Number);
  return h;
};

// Helper to convert training day name to day index
const dayNameToIndex = (name: string): number => {
  const map: Record<string, number> = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
    Friday: 4, Saturday: 5, Sunday: 6,
  };
  return map[name] ?? -1;
};

// Planner page with timetable view and CCA conflict detection
const PlannerPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCCAIds, setSelectedCCAIds] = useState<Set<string>>(new Set());

  // Fetch user's timetable
  const { data: timetable } = useQuery({
    queryKey: ["user-timetable"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_timetable").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all CCAs
  const { data: ccas } = useQuery({
    queryKey: ["all-ccas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ccas").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch saved CCAs
  const { data: savedCCAs } = useQuery({
    queryKey: ["saved-ccas-ids"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cca_wishlist").select("cca_id").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((w) => w.cca_id);
    },
    enabled: !!user,
  });

  // Filter CCAs for search
  const filteredCCAs = ccas?.filter((cca) =>
    cca.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle CCA selection
  const toggleCCA = (ccaId: string) => {
    const next = new Set(selectedCCAIds);
    if (next.has(ccaId)) next.delete(ccaId);
    else next.add(ccaId);
    setSelectedCCAIds(next);
  };

  // Build timetable events from user timetable + selected CCAs
  const allEvents = useMemo(() => {
    const events: Array<{
      name: string;
      day: number;
      startHour: number;
      endHour: number;
      type: "class" | "cca";
      conflict?: boolean;
    }> = [];

    // Add class events from timetable
    timetable?.forEach((entry) => {
      events.push({
        name: entry.event_name,
        day: entry.day_of_week,
        startHour: timeToHour(entry.start_time),
        endHour: timeToHour(entry.end_time),
        type: entry.event_type as "class" | "cca",
      });
    });

    // Add selected CCA events
    selectedCCAIds.forEach((ccaId) => {
      const cca = ccas?.find((c) => c.id === ccaId);
      if (!cca || !cca.training_days || !cca.training_time) return;
      const [startStr, endStr] = cca.training_time.split("-");
      if (!startStr || !endStr) return;
      const startHour = parseInt(startStr.substring(0, 2));
      const endHour = parseInt(endStr.substring(0, 2));

      cca.training_days.forEach((dayName) => {
        const dayIndex = dayNameToIndex(dayName);
        if (dayIndex < 0) return;
        events.push({
          name: cca.name,
          day: dayIndex,
          startHour,
          endHour,
          type: "cca",
        });
      });
    });

    // Detect conflicts
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (events[i].day === events[j].day) {
          const overlap =
            events[i].startHour < events[j].endHour &&
            events[j].startHour < events[i].endHour;
          if (overlap) {
            events[i].conflict = true;
            events[j].conflict = true;
          }
        }
      }
    }

    return events;
  }, [timetable, selectedCCAIds, ccas]);

  // Get conflicts list
  const conflicts = allEvents.filter((e) => e.conflict);

  // Submit application
  const submitMutation = useMutation({
    mutationFn: async () => {
      const inserts = Array.from(selectedCCAIds).map((cca_id) => ({
        user_id: user!.id,
        cca_id,
        status: "pending" as const,
      }));
      const { error } = await supabase.from("applications").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Applications submitted! 🎉" });
      setSelectedCCAIds(new Set());
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="font-anton text-3xl text-foreground mb-6">
          {user ? "Your Schedule Planner" : "Schedule Planner"}
        </h1>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Timetable */}
          <div className="bg-card rounded-xl shadow-md overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-primary text-primary-foreground font-anton">TIME\DAY</th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-border p-2 bg-primary text-primary-foreground font-anton">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="border border-border p-1 text-center font-montserrat text-muted-foreground bg-secondary">
                      {String(hour).padStart(2, "0")}00 to<br />{String(hour + 1).padStart(2, "0")}00
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const eventsHere = allEvents.filter(
                        (e) => e.day === dayIdx && e.startHour <= hour && e.endHour > hour
                      );
                      return (
                        <td
                          key={dayIdx}
                          className={`border border-border p-1 h-12 relative ${
                            eventsHere.some((e) => e.conflict)
                              ? "bg-destructive/20"
                              : eventsHere.length > 0
                              ? eventsHere[0].type === "cca"
                                ? "bg-gold/20"
                                : "bg-primary/10"
                              : "bg-secondary/30"
                          }`}
                        >
                          {eventsHere.map((ev, i) => (
                            <div key={i} className={`text-[10px] font-montserrat font-medium truncate ${
                              ev.conflict ? "text-destructive" : ev.type === "cca" ? "text-gold-foreground" : "text-foreground"
                            }`}>
                              {ev.name}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: CCA Selection */}
          <div className="space-y-4">
            {/* View toggles */}
            <div className="bg-card rounded-xl p-4 shadow-md">
              <h3 className="font-anton text-lg text-foreground mb-3">Select CCAs</h3>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search CCAs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>

              {/* CCA list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCCAs?.map((cca) => (
                  <button
                    key={cca.id}
                    onClick={() => toggleCCA(cca.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-montserrat transition-colors ${
                      selectedCCAIds.has(cca.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {cca.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Conflicts warning */}
            {conflicts.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h4 className="font-anton text-sm text-destructive">Time Clash Detected!</h4>
                </div>
                {Array.from(new Set(conflicts.map((c) => c.name))).map((name) => (
                  <p key={name} className="text-xs text-destructive font-montserrat">• {name}</p>
                ))}
              </div>
            )}

            {/* Submit button */}
            <Button
              variant="accent"
              className="w-full font-montserrat"
              size="lg"
              disabled={selectedCCAIds.size === 0}
              onClick={() => submitMutation.mutate()}
            >
              <Send className="h-4 w-4" />
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;

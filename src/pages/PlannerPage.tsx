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
  // View mode state for CCA list
  const [viewMode, setViewMode] = useState<'all' | 'saved' | 'filter'>('all');

  // Fetch user's timetable
  const { data: timetable } = useQuery({
    queryKey: ["user-timetable"],
    queryFn: async () => {
      // Hardcoded timetable for everyone
      return [
        {
          event_name: "SS5102 TUT 1 NIE\nCourts\n1730to2020",
          day_of_week: 0,
          start_time: "17:30",
          end_time: "21:00",
          event_type: "class"
        },
        {
          event_name: "IE4791 LEC/STU\nEELE LT27\n1330to1620",
          day_of_week: 2,
          start_time: "13:30",
          end_time: "17:00",
          event_type: "class"
        },
        {
          event_name: "DV2008 TUT EE01\nS2.2-B4-04\n1830to2120",
          day_of_week: 2,
          start_time: "18:30",
          end_time: "22:00",
          event_type: "class"
        },
        {
          event_name: "IE3102 TUT EE02\nTR+93\n1330to1450",
          day_of_week: 3,
          start_time: "13:30",
          end_time: "15:00",
          event_type: "class"
        }
      ];
    },
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

  // Fetch user's existing applications
  const { data: existingApplications } = useQuery({
    queryKey: ["user-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("cca_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((app) => app.cca_id);
    },
    enabled: !!user,
  });

  // Filter CCAs for search
  const filteredCCAs = ccas?.filter((cca) =>
    cca.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle CCA selection
  const toggleCCA = (ccaId: string) => {
    // Check if already applied
    if (existingApplications?.includes(ccaId)) {
      toast({
        title: "Already Applied",
        description: "You have already applied for this CCA",
        variant: "destructive",
      });
      return;
    }

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
            <table className="w-full table-fixed border-collapse text-xs min-w-[600px]">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-primary text-primary-foreground font-anton w-20">TIME\DAY</th>
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
                      const eventsStartingHere = allEvents.filter(
                        (e) => e.day === dayIdx && e.startHour === hour
                      );

                      return (
                        <td
                          key={dayIdx}
                          className="border border-border p-0 h-12 relative bg-secondary/30 align-top"
                        >
                          {eventsStartingHere.map((ev, i) => {
                            const duration = ev.endHour - ev.startHour;
                            const isCCA = ev.type === "cca";
                            
                            // Check if there is a smaller event starting at the same time covering the top
                            const overlapsWithSmallerAtStart = allEvents.some(
                              (other) =>
                                other !== ev &&
                                other.day === ev.day &&
                                other.startHour === ev.startHour &&
                                (other.endHour - other.startHour) < duration
                            );

                            let bgClass = "bg-primary/10 text-foreground border-primary/20";
                            // Base zIndex: smaller events get higher z-index to appear on top
                            let zIndex = 100 - duration;

                            if (isCCA) {
                              zIndex += 50; // CCAs generally above classes
                              if (ev.conflict) {
                                bgClass = "bg-destructive text-destructive-foreground border-red-700 font-bold shadow-lg";
                              } else {
                                bgClass = "bg-gold text-gold-foreground border-yellow-600 shadow-md";
                              }
                            } else if (ev.conflict) {
                               // For classes that have a conflict
                               bgClass = "bg-destructive/30 text-foreground border-destructive/50";
                            }

                            return (
                              <div
                                key={i}
                                className={`absolute left-0 right-0 border p-1 overflow-hidden rounded-sm m-[1px] flex flex-col ${overlapsWithSmallerAtStart ? "justify-end pb-8" : "justify-start"} ${bgClass}`}
                                style={{
                                  top: 0,
                                  height: `calc(${duration * 100}% - 2px)`,
                                  zIndex: zIndex
                                }}
                              >
                                <div className="text-[10px] font-montserrat whitespace-pre-wrap leading-tight">
                                  {ev.name}
                                </div>
                              </div>
                            );
                          })}
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
            <div className="bg-[#1e1e40] rounded-xl p-4 shadow-md flex flex-col gap-4">
              
              {/* View toggles stacked like a menu */}
              <div className="flex flex-col overflow-hidden rounded-md border border-white/20">
                {[
                  { value: 'all', label: 'View All CCA' },
                  { value: 'saved', label: 'View Saved CCA' },
                  { value: 'filter', label: 'View By Filter' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setViewMode(option.value as 'all' | 'saved' | 'filter')}
                    className={`relative flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${
                      viewMode === option.value
                        ? "bg-[#D91E41] text-white"
                        : "bg-white text-muted-foreground hover:bg-gray-50"
                    }`}
                    style={viewMode !== option.value ? { borderBottom: '1px solid #eee' } : {}}
                  >
                    {viewMode === option.value && (
                      <span
                        className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent mr-2"
                        aria-hidden="true"
                      />
                    )}
                    <span className={viewMode !== option.value ? 'ml-3' : ''}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* CCAs List container */}
              <div className="bg-white rounded-lg p-3">
                {/* Search - only in filter view or always? It seems to be under View By Filter, but we can keep it inside the container always just changing the filtered set */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search CCAs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm border-gray-300"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {(viewMode === "all" || viewMode === "filter" 
                    ? filteredCCAs 
                    : filteredCCAs?.filter((cca) => savedCCAs?.includes(cca.id))
                  )?.map((cca) => {
                    const isAlreadyApplied = existingApplications?.includes(cca.id);
                    return (
                      <button
                        key={cca.id}
                        onClick={() => toggleCCA(cca.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isAlreadyApplied
                            ? "bg-secondary/40 text-destructive cursor-not-allowed"
                            : selectedCCAIds.has(cca.id)
                            ? "bg-[#D91E41]/10 border border-[#D91E41]/30 text-[#D91E41]"
                            : "bg-[#e5e5e5] hover:bg-[#d5d5d5] text-gray-800"
                        }`}
                        disabled={isAlreadyApplied}
                      >
                        {cca.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conflicts warning */}
              {conflicts.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mt-2">
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
                className="w-full font-bold bg-[#D91E41] hover:bg-[#b01633] text-white py-6 mt-2"
                size="lg"
                disabled={selectedCCAIds.size === 0}
                onClick={() => {
                  if (conflicts.length > 0) {
                    toast({
                      title: "Time Clash Warning",
                      description: "Applying despite time conflicts.",
                      variant: "destructive",
                    });
                  }
                  submitMutation.mutate();
                }}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;

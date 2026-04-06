// ProfilePage - User profile with applications and personal info
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, FileText, Save } from "lucide-react";

// Profile page showing user info and application status
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    matric_number: "",
    faculty: "",
    year_of_study: 1,
    bio: "",
  });

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      // Initialize form data
      setFormData({
        full_name: data.full_name || "",
        matric_number: data.matric_number || "",
        faculty: data.faculty || "",
        year_of_study: data.year_of_study || 1,
        bio: data.bio || "",
      });
      return data;
    },
    enabled: !!user,
  });

  // Fetch applications with CCA details
  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, ccas(*)")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      toast({ title: "Profile updated!" });
    },
  });

  // Get status badge color
  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gold text-gold-foreground";
      case "accepted": return "bg-green-500 text-primary-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "withdrawn": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-4xl text-primary-foreground italic">My Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Profile info */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-anton text-2xl text-foreground">{profile?.full_name}</h2>
                <p className="text-sm text-muted-foreground font-montserrat">{user?.email}</p>
              </div>
            </div>
            <Button
              variant={editing ? "accent" : "outline"}
              size="sm"
              onClick={() => {
                if (editing) updateProfile.mutate();
                else setEditing(true);
              }}
            >
              <Save className="h-4 w-4" />
              {editing ? "Save" : "Edit"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-montserrat">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div>
              <Label className="font-montserrat">Matric Number</Label>
              <Input
                value={formData.matric_number}
                onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                disabled={!editing}
                placeholder="e.g. U2345678A"
              />
            </div>
            <div>
              <Label className="font-montserrat">Faculty</Label>
              <Input
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                disabled={!editing}
                placeholder="e.g. School of Computer Science"
              />
            </div>
            <div>
              <Label className="font-montserrat">Year of Study</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: parseInt(e.target.value) })}
                disabled={!editing}
              />
            </div>
            <div>
              <Label className="font-montserrat">Bio</Label>
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!editing}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-anton text-2xl text-foreground">My Applications</h2>
          </div>

          {applications && applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-montserrat font-semibold text-foreground">{app.ccas?.name}</p>
                    <p className="text-xs text-muted-foreground font-montserrat">
                      Applied {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${statusColor(app.status)} font-montserrat capitalize`}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground font-montserrat text-center py-8">
              No applications yet. Head to the Planner to apply!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

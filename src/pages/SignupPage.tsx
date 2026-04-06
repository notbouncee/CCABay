// SignupPage - New user registration
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Signup form component
const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle signup form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast({ title: "Account created!", description: "You can now log in." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-anton text-5xl">
            <span className="text-accent">CCA</span>
            <span className="text-gold">BAY</span>
          </h1>
          <p className="text-primary-foreground/70 font-montserrat mt-2">
            Join the NTU CCA community
          </p>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-2xl space-y-4">
          <h2 className="font-anton text-2xl text-foreground text-center">Create Account</h2>

          <div className="space-y-2">
            <Label htmlFor="name" className="font-montserrat">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Branden Phua"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-montserrat">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@e.ntu.edu.sg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-montserrat">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" variant="accent" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-montserrat">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

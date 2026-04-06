// LoginPage - User authentication with email and password
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Login form component
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
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
            Discover your perfect CCA at NTU
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-2xl space-y-4">
          <h2 className="font-anton text-2xl text-foreground text-center">Welcome Back</h2>

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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" variant="accent" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-montserrat">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

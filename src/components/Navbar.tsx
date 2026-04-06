// Navbar component - Top navigation bar with CCABay branding and nav links
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Explore", path: "/explore" },
  { name: "MatchMe", path: "/matchme" },
  { name: "Planner", path: "/planner" },
  { name: "My Profile", path: "/profile" },
  { name: "Saved CCAs", path: "/saved" },
];

// Main navigation bar component
const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-anton text-2xl text-accent">CCA</span>
          <span className="font-anton text-2xl text-gold">BAY</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-montserrat font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-gold"
                  : "text-primary-foreground hover:text-gold"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right side: NTU logo + auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:text-gold hover:bg-navy-light">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="gold" size="sm">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-navy-light pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 text-sm font-montserrat ${
                location.pathname === link.path
                  ? "text-gold"
                  : "text-primary-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <button onClick={signOut} className="px-4 py-2 text-sm text-primary-foreground font-montserrat">
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gold font-montserrat">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

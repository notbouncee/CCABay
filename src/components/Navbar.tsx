import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Explore", path: "/explore" },
  { name: "Planner", path: "/planner" },
  { name: "MatchMe", path: "/matchme" },
];

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const iconClass = "h-8 w-8 object-contain transition-opacity duration-200 hover:opacity-100 active:opacity-100";
  const whiteIconFilter =
    "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(162deg) brightness(102%) contrast(101%)";
  const yellowIconFilter =
    "brightness(0) saturate(100%) invert(86%) sepia(80%) saturate(1330%) hue-rotate(349deg) brightness(104%) contrast(103%)";

  // Dropdown state for profile icon (desktop)
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-[9999] bg-primary shadow-lg">
      <div className="mx-auto flex h-[78px] w-full items-center justify-between px-6 md:px-10 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center leading-none">
          <span className="font-anton text-[40px] leading-none tracking-tight text-white">
            CCA
          </span>
          <span className="font-anton text-[40px] leading-none tracking-tight text-[#D71440]">
            BAY
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12 lg:gap-16">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-montserrat text-[20px] transition-colors ${
                  isActive
                    ? "font-bold text-[#FFDD00]"
                    : "font-normal text-primary-foreground hover:text-[#FFDD00]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <button type="button" aria-label="Search" className="bg-transparent p-0">
            <img
              src="/icons/search.png"
              alt="Search"
              className={iconClass}
              style={{
                filter: whiteIconFilter,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = yellowIconFilter;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = whiteIconFilter;
              }}
            />
          </button>

          {/* Profile dropdown (desktop) */}
          {/* Profile dropdown (desktop) with hover fix */}
          <div style={{ position: 'relative', minWidth: 48 }}>
            <div
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
            >
              <Link to={user ? "/profile" : "/login"} aria-label="Profile">
                <img
                  src={user ? "/icons/profileLoggedIn.png" : "/icons/profile.png"}
                  alt="Profile"
                  className={iconClass}
                  style={{
                    filter:
                      location.pathname === "/profile" ? yellowIconFilter : whiteIconFilter,
                  }}
                />
              </Link>
              {/* Invisible hover bridge between icon and dropdown */}
              {/* Removed vertical hover bridge for seamless dropdown */}
              {/* Dropdown on hover if logged in */}
              {user && dropdownOpen && (
                <div
                  className="min-w-[140px] rounded-md bg-white shadow-lg border border-gray-200 transition-all z-50 flex flex-col"
                  style={{ position: 'absolute', right: 0, top: '100%', marginTop: 0, paddingTop: 0 }}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#D71440] hover:text-white group rounded-md border-0 bg-transparent shadow-none focus:outline-none"
                    tabIndex={0}
                  >
                    <LogOut className="h-5 w-5 group-hover:text-white" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <Link to={user ? "/saved" : "/login"} aria-label="Saved CCAs">
            <img
              src="/icons/save.png"
              alt="Saved CCAs"
              className={iconClass}
              style={{
                filter: location.pathname === "/saved" ? yellowIconFilter : whiteIconFilter,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = yellowIconFilter;
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/saved") {
                  e.currentTarget.style.filter = whiteIconFilter;
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.filter = yellowIconFilter;
              }}
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary px-6 pb-5 pt-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 font-montserrat text-[20px] transition-colors ${
                    isActive
                      ? "font-bold text-[#FFDD00]"
                      : "font-normal text-primary-foreground hover:text-[#FFDD00]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className="py-3 font-montserrat text-[20px] font-normal text-primary-foreground hover:text-[#FFDD00]"
            >
              Search
            </Link>

            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="py-3 font-montserrat text-[20px] font-normal text-primary-foreground hover:text-[#FFDD00]"
            >
              My Profile
            </Link>

            <Link
              to={user ? "/saved" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="py-3 font-montserrat text-[20px] font-normal text-primary-foreground hover:text-[#FFDD00]"
            >
              Saved CCAs
            </Link>

            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 py-3 text-left font-montserrat text-[20px] font-normal text-primary-foreground hover:text-[#FFDD00]"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
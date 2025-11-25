// src/components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../store/useThemeStore";

const LOGO = "https://roxiler.com/wp-content/uploads/2024/06/Group.svg";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (err) {
      // optionally handle error
    }
    navigate("/login", { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 shadow-sm">
      <div className="h-full">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: logo */}
          <div className="flex items-center gap-3">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className="flex items-center">
              <img src={LOGO} alt="Roxiler" className="object-contain" />
              <span className="sr-only">Roxiler</span>
            </NavLink>
          </div>

        
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:opacity-80 transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-3">
              {!authUser ? (
                <>
                  <NavLink
                    to="/login"
                    className="px-3 py-1 rounded-md text-sm font-medium hover:opacity-90"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="px-3 py-1 rounded-md text-sm font-medium border border-current"
                  >
                    Signup
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium hover:opacity-90"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              {/* If mobile, show login/signup or logout icon */}
              {!authUser ? (
                <NavLink to="/login" className="px-2 py-1 text-sm font-medium">
                  Login
                </NavLink>
              ) : (
                <button onClick={handleLogout} title="Logout" className="p-2 rounded-md">
                  <LogOut size={20} />
                </button>
              )}

              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="p-2 rounded-md"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t">
            <div className="px-4 py-3 space-y-2 flex flex-col">
              
              {!authUser ? (
                <>
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className="block py-2">
                    Login
                  </NavLink>
                  <NavLink to="/signup" onClick={() => setMenuOpen(false)} className="block py-2">
                    Signup
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 py-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* default: light (white bg, black text) */
        nav { background: #ffffff; color: #000000; }
        nav a, nav button { color: inherit; }

        /* if your app toggles dark mode by adding 'dark' to <html> (Tailwind default),
           invert nav colors to black background with white text */
        html.dark nav { background: #000000; color: #ffffff; }
        html.dark nav a, html.dark nav button { color: inherit; }

        /* ensure border/shadow match monochrome look */
        nav { box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
        html.dark nav { box-shadow: 0 1px 2px rgba(255,255,255,0.03); }
      `}</style>
    </nav>
  );
};

export default Navbar;

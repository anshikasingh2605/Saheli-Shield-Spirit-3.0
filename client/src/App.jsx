
import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  Bell,
  ShieldCheck,
  LogOut,
  Navigation,
  ScanSearch,
  Users,
  Sun,
  Moon,
} from "lucide-react";

import api from "./services/api";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SaheliRoute from "./pages/SaheliRoute";
import ScamSaathi from "./pages/Scamsaathi";
import TrustedContacts from "./pages/TrustedContacts";
import ActivityHistory from "./pages/ActivityHistory";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";

const VALID_PAGES = ["dashboard", "route", "scam", "contacts", "history", "settings"];

function getInitialPage() {
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase().trim();
  if (VALID_PAGES.includes(hash)) {
    return hash;
  }
  const saved = localStorage.getItem("sahelishield_page");
  if (VALID_PAGES.includes(saved)) {
    return saved;
  }
  return "dashboard";
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("sahelishield_theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    try {
      document.documentElement.classList.add("theme-transition");
    } catch {}
    setDarkMode(next);
    try {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("sahelishield_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("sahelishield_theme", "light");
      }
    } catch {}
    window.setTimeout(() => {
      try {
        document.documentElement.classList.remove("theme-transition");
      } catch {}
    }, 500);
  };
  const [routeParams, setRouteParams] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sahelishield_route_params");
      return saved ? JSON.parse(saved) : { start: "", destination: "" };
    } catch {
      return { start: "", destination: "" };
    }
  });

  function handleNavigateToRoute(params) {
    if (params) {
      setRouteParams(params);
      try {
        sessionStorage.setItem("sahelishield_route_params", JSON.stringify(params));
      } catch {}
    }
    navigateTo("route");
  }

  // Keep URL hash and page state in sync on refresh and browser back/forward buttons
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase().trim();
      if (VALID_PAGES.includes(hash)) {
        setPage(hash);
        localStorage.setItem("sahelishield_page", hash);
      }
    }

    if (!window.location.hash || !VALID_PAGES.includes(window.location.hash.replace(/^#\/?/, ""))) {
      window.location.hash = `#/${page}`;
    } else {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase().trim();
      if (VALID_PAGES.includes(hash) && hash !== page) {
        setPage(hash);
      }
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("sahelishield_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authStatus, setAuthStatus] = useState(() =>
    localStorage.getItem("sahelishield_token")
      ? "checking"
      : "unauthenticated"
  );

  const [authError, setAuthError] = useState("");

  // Verify the saved JWT with the backend.
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem("sahelishield_token");

    if (!token) {
      setUser(null);
      setAuthStatus("unauthenticated");
      return;
    }

    // Retain verified Google OAuth sessions without requiring external backend validation
    const savedUserStr = localStorage.getItem("sahelishield_user");
    if (token.startsWith("google_") && savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && (parsed.email || parsed.name)) {
          setUser(parsed);
          setAuthStatus("authenticated");
          return;
        }
      } catch {}
    }

    setAuthStatus("checking");
    setAuthError("");

    try {
      const response = await api.get("/auth/me");
      const currentUser = response.data?.data?.user;

      if (!currentUser) {
        throw new Error(
          "The backend did not return the expected user profile."
        );
      }

      localStorage.setItem(
        "sahelishield_user",
        JSON.stringify(currentUser)
      );

      setUser(currentUser);
      setAuthStatus("authenticated");
    } catch (error) {
      const status = error.response?.status;

      if ([401, 403, 404].includes(status)) {
        // The token is invalid, expired, or its account no longer exists.
        localStorage.removeItem("sahelishield_token");
        localStorage.removeItem("sahelishield_user");

        setUser(null);
        setAuthStatus("unauthenticated");
      } else {
        // Keep the session so the user can retry if the server recovers.
        setAuthError(
          error.response
            ? "The server could not verify your session. Please try again."
            : "Cannot reach the backend. Check that it is running and try again."
        );

        setAuthStatus("error");
      }
    }
  }, []);

  // Check the session when the app first loads or refreshes.
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  function handleLogin(authenticatedUser) {
    setUser(authenticatedUser);
    setAuthStatus("authenticated");
    setAuthError("");
    setPage("dashboard");
    setSidebarOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("sahelishield_token");
    localStorage.removeItem("sahelishield_user");
    localStorage.removeItem("sahelishield_page");
    sessionStorage.removeItem("sahelishield_route_params");

    setUser(null);
    setAuthStatus("unauthenticated");
    setAuthError("");
    setPage("dashboard");
    window.location.hash = "#/dashboard";
    setSidebarOpen(false);
  }

  function navigateTo(nextPage) {
    const target = VALID_PAGES.includes(nextPage) ? nextPage : "dashboard";
    setPage(target);
    localStorage.setItem("sahelishield_page", target);
    window.location.hash = `#/${target}`;
    setSidebarOpen(false);
  }

  const titles = {
    dashboard: "Dashboard",
    route: "SaheliRoute",
    scam: "ScamSaathi",
    contacts: "Trusted Contacts",
    history: "Activity History",
    settings: "Settings",
  };

  function renderPage() {
    switch (page) {
      case "route":
        return (
          <SaheliRoute
            initialStart={routeParams.start}
            initialDestination={routeParams.destination}
          />
        );

      case "scam":
        return <ScamSaathi />;

      case "contacts":
        return <TrustedContacts />;

      case "history":
        return <ActivityHistory />;

      case "settings":
        return <Settings onLogout={handleLogout} />;

      case "dashboard":
      default:
        return (
          <Dashboard
            setPage={navigateTo}
            user={user}
            onNavigateToRoute={handleNavigateToRoute}
          />
        );
    }
  }

  // Don't display the dashboard while the token is being checked.
  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#111318] dark:text-[#F1F5F9] font-sans-ui transition-colors">
        <div className="text-center p-6">
          <img
            src="/logo.png"
            alt="SaheliShield"
            className="mx-auto mb-4 h-12 w-12 rounded-xl object-contain shadow-md ring-1 ring-[#7E0E32]/20 dark:ring-white/10 animate-pulse"
          />
          <p className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC]">
            Verifying your session...
          </p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#94A3B8]">
            Please wait while we check your account.
          </p>
        </div>
      </div>
    );
  }

  // A temporary network/server error should allow retrying.
  if (authStatus === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#111318] dark:text-[#F1F5F9] font-sans-ui p-5 transition-colors">
        <div className="w-full max-w-md rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-8 text-center shadow-xl">
          <img
            src="/logo.png"
            alt="SaheliShield"
            className="mx-auto mb-4 h-12 w-12 rounded-xl object-contain shadow-md"
          />

          <h1 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC]">
            Unable to verify your session
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B7280] dark:text-[#94A3B8]">
            {authError}
          </p>

          <button
            type="button"
            onClick={verifySession}
            className="mt-6 w-full rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 py-3 font-bold text-white shadow-md shadow-[#7E0E32]/20 transition active:scale-95 cursor-pointer"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-2xl border border-[#DEC4CB] dark:border-[#253146] px-4 py-3 font-semibold text-[#111318] dark:text-[#F1F5F9] hover:bg-[#FFF9F5] dark:hover:bg-[#1E293B] transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (authStatus !== "authenticated" || !user) {
    if (showAuthModal) {
      return (
        <Auth
          onLogin={handleLogin}
          onBack={() => setShowAuthModal(false)}
        />
      );
    }

    return <Landing onGetStarted={() => setShowAuthModal(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#111318] dark:text-[#F1F5F9] font-sans-ui transition-colors duration-200">
      <Sidebar
        page={page}
        setPage={navigateTo}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 sm:h-[72px] items-center justify-between border-b border-[#E8D7DC] dark:border-[#1E293B] bg-[#FFF9F5]/95 dark:bg-[#0B0E14]/95 px-3 sm:px-6 backdrop-blur-md transition-colors">
          {/* Left section: Hamburger button + Brand title */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#DEC4CB] dark:border-[#253146] p-1.5 sm:p-2 text-[#111318] dark:text-[#F1F5F9] shadow-2xs transition hover:bg-white dark:hover:bg-[#1E293B] hover:border-[#7E0E32] dark:hover:border-[#FB7185] focus:outline-none cursor-pointer"
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="flex items-center gap-2.5 sm:gap-3 text-left transition hover:opacity-90 group shrink-0 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="SaheliShield"
                className="h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 rounded-xl object-contain shadow-xs ring-1 ring-[#7E0E32]/10 dark:ring-white/10 shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <span className="font-serif-editorial text-lg sm:text-xl font-bold tracking-tight text-[#7E0E32] dark:text-[#FB7185] leading-none select-none">
                  Saheli<span className="text-[#111318] dark:text-[#F1F5F9]">Shield</span>
                </span>
                <p className="text-[10px] text-[#7E0E32]/80 dark:text-[#FB7185]/80 font-bold tracking-wider uppercase leading-none mt-0.5">
                  Safety Platform
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs: Responsive Segmented Capsule Control */}
          <nav className="inline-flex items-center rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/80 dark:bg-[#161D2B]/80 p-1 shadow-2xs backdrop-blur-xs">
            <button
              type="button"
              onClick={() => navigateTo("route")}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                page === "route"
                  ? "bg-[#7E0E32] text-white shadow-xs"
                  : "text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Navigation size={13} className={page === "route" ? "text-white" : "text-[#7E0E32] dark:text-[#FB7185]"} />
              <span className="hidden sm:inline">SaheliRoute</span>
              <span className="sm:hidden">Route</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("scam")}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                page === "scam"
                  ? "bg-[#0D9488] text-white shadow-xs"
                  : "text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <ScanSearch size={13} className={page === "scam" ? "text-white" : "text-[#0D9488] dark:text-[#2DD4BF]"} />
              <span className="hidden sm:inline">ScamSaathi</span>
              <span className="sm:hidden">Scam</span>
            </button>
          </nav>

          {/* Right Action Items: Contacts Icon + Theme Toggle + User Avatar + Sign out */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Contacts Icon Button */}
            <button
              type="button"
              onClick={() => navigateTo("contacts")}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                page === "contacts"
                  ? "border-[#7E0E32] bg-[#7E0E32]/10 text-[#7E0E32] dark:border-[#FB7185] dark:bg-[#FB7185]/15 dark:text-[#FB7185]"
                  : "border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B] text-[#4B5563] dark:text-[#94A3B8] hover:border-[#7E0E32] dark:hover:border-[#FB7185] hover:text-[#111318] dark:hover:text-[#F1F5F9]"
              }`}
              title="Trusted Contacts"
              aria-label="Trusted Contacts"
            >
              <Users size={14} className={page === "contacts" ? "text-[#7E0E32] dark:text-[#FB7185]" : "text-[#7E0E32] dark:text-[#FB7185]"} />
              <span className="hidden md:inline">Contacts</span>
            </button>

            {/* Interactive Theme Toggle Switch */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B] px-2.5 sm:px-3 py-1.5 text-xs font-bold shadow-2xs transition hover:border-[#7E0E32] dark:hover:border-[#FB7185] cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              <div
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full transition-colors ${
                  darkMode
                    ? "bg-[#7E0E32] text-amber-300"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {darkMode ? (
                  <Moon size={12} className="fill-current text-amber-300" />
                ) : (
                  <Sun size={12} className="fill-current text-amber-500" />
                )}
              </div>
              <span className="font-extrabold text-[#2D3748] dark:text-[#F1F5F9] text-xs hidden lg:inline">
                {darkMode ? "Dark" : "Light"}
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7E0E32] to-[#2D0B40] text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-[#7E0E32]/30 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                (user.name || user.fullName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B] px-3 py-1.5 text-xs font-bold text-[#4B5563] dark:text-[#94A3B8] hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
              title="Sign out"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] w-full p-3.5 sm:p-6 lg:p-8 flex-1">
          {renderPage()}
        </main>

        <footer className="border-t border-[#E8D7DC] dark:border-[#1E293B] px-8 py-6 text-center text-xs text-[#6B7280] dark:text-[#64748B] transition-colors">
          <ShieldCheck className="mr-1 inline text-[#7E0E32] dark:text-[#FB7185]" size={14} />
          SaheliShield · One shield for safety everywhere
        </footer>
      </div>
    </div>
  );
}

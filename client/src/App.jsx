
import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  Bell,
  ShieldCheck,
  LogOut,
  Navigation,
  ScanSearch,
  Users,
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
        return <Settings />;

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <ShieldCheck
            size={42}
            className="mx-auto mb-4 text-violet-700"
          />
          <p className="font-semibold text-slate-900">
            Verifying your session...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Please wait while we check your account.
          </p>
        </div>
      </div>
    );
  }

  // A temporary network/server error should allow retrying.
  if (authStatus === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck
            size={40}
            className="mx-auto mb-4 text-violet-700"
          />

          <h1 className="text-xl font-bold text-slate-900">
            Unable to verify your session
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {authError}
          </p>

          <button
            type="button"
            onClick={verifySession}
            className="mt-6 w-full rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white hover:bg-violet-800"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (authStatus !== "authenticated" || !user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        page={page}
        setPage={navigateTo}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 sm:h-[72px] items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 sm:px-6 backdrop-blur-md">
          {/* Left section: Hamburger button + Brand title */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200/90 p-1.5 sm:p-2 text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="flex items-center gap-2 sm:gap-2.5 text-left transition hover:opacity-90"
            >
              <img
                src="/logo.png"
                alt="SaheliShield"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shadow-sm ring-1 ring-purple-100 shrink-0"
              />
              <div className="hidden lg:block">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  SaheliShield
                </span>
                <p className="text-[10px] text-purple-700 font-semibold tracking-wide uppercase">
                  Safety Platform
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs: Responsive Segmented Capsule Control */}
          <nav className="inline-flex items-center rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-100/70 p-0.5 sm:p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => navigateTo("route")}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                page === "route"
                  ? "bg-white text-purple-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Navigation size={14} className={page === "route" ? "text-purple-700" : "text-purple-600"} />
              <span className="hidden sm:inline">SaheliRoute</span>
              <span className="sm:hidden">Route</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("scam")}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                page === "scam"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <ScanSearch size={14} className={page === "scam" ? "text-emerald-700" : "text-emerald-600"} />
              <span className="hidden sm:inline">ScamSaathi</span>
              <span className="sm:hidden">Scam</span>
            </button>
          </nav>

          {/* Right Action Items: Contacts Icon + Notifications + User Avatar + Sign out */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Contacts Icon Button */}
            <button
              type="button"
              onClick={() => navigateTo("contacts")}
              className={`flex items-center gap-1.5 rounded-xl border p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold transition shadow-xs ${
                page === "contacts"
                  ? "border-purple-300 bg-purple-50 text-purple-800 ring-2 ring-purple-100"
                  : "border-slate-200/90 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/50 hover:text-purple-800"
              }`}
              title="Trusted Contacts"
              aria-label="Trusted Contacts"
            >
              <Users size={16} className="text-purple-600" />
              <span className="hidden md:inline">Contacts</span>
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200/80 p-1.5 sm:p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xs sm:text-sm font-bold text-purple-800 ring-1 ring-purple-200/60">
              {(user.name || user.fullName || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Sign out"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
          {renderPage()}
        </main>

        <footer className="px-8 pb-6 text-center text-xs text-slate-400">
          <ShieldCheck className="mr-1 inline" size={14} />
          SaheliShield · One shield for safety everywhere
        </footer>
      </div>
    </div>
  );
}


import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  Bell,
  ShieldCheck,
  LogOut,
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
  }, [page]);

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
      />

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="font-semibold text-slate-900">
                {titles[page] || "Dashboard"}
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                SaheliShield Safety Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <span className="hidden max-w-40 truncate text-sm text-slate-600 md:block">
              {user.name || user.fullName || user.email || "User"}
            </span>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {(user.name || user.fullName || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
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

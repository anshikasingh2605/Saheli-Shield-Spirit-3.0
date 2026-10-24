
import { useEffect } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  ScanSearch,
  Users,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ page, setPage, open, setOpen, user, onLogout }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "route", label: "SaheliRoute", icon: MapPin },
    { id: "scam", label: "ScamSaathi", icon: ScanSearch },
    { id: "contacts", label: "Trusted Contacts", icon: Users },
    { id: "history", label: "Activity History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Backdrop overlay for all viewports */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Smooth Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Navigation drawer"
      >
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setPage("dashboard");
              setOpen(false);
            }}
            className="flex items-center gap-3 text-left transition hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="SaheliShield"
              className="h-10 w-10 rounded-xl object-contain shadow-sm ring-1 ring-purple-100"
            />
            <div>
              <h1 className="text-base font-extrabold text-slate-900">
                SaheliShield
              </h1>
              <p className="text-[11px] text-purple-700 font-medium">
                Safety & Threat Protection
              </p>
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active
                    ? "bg-purple-50 text-purple-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon size={19} className={active ? "text-purple-700" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Safety Tip Card */}
        <div className="rounded-2xl bg-purple-50/70 p-3.5 mt-3 border border-purple-100/60">
          <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-purple-700" />
            Your Safety Companion
          </p>
          <p className="mt-1 text-[11px] leading-4 text-purple-900/80">
            Emergency helpline 112 is active 24/7. Stay connected.
          </p>
        </div>

        {/* User profile & Sign out */}
        {user && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xs font-bold text-purple-800">
                {(user.name || user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.name || user.fullName || "User"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user.email || ""}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

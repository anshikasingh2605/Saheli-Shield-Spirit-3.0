
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#E8D7DC] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#161D2B] p-5 shadow-2xl transition-transform duration-300 ease-in-out font-sans-ui ${open ? "translate-x-0" : "-translate-x-full"
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
            className="flex items-center gap-2.5 text-left transition hover:opacity-90 group cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="SaheliShield"
              className="h-10 w-10 rounded-xl object-contain shadow-xs ring-1 ring-[#7E0E32]/10 dark:ring-white/10 shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <div>
              <h1 className="font-serif-editorial text-xl font-bold tracking-tight text-[#7E0E32] dark:text-[#FB7185] leading-none select-none">
                Saheli<span className="text-[#111318] dark:text-[#F1F5F9]">Shield</span>
              </h1>
              <p className="text-[10px] text-[#7E0E32]/80 dark:text-[#FB7185]/80 font-bold tracking-wider uppercase leading-none mt-1">
                Safety & Protection
              </p>
            </div>
          </button>

          <button
            type="button"
            className="rounded-xl p-1.5 text-[#6B7280] dark:text-[#94A3B8] transition hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111318] dark:hover:text-[#F1F5F9] cursor-pointer"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#6B7280] dark:text-[#64748B]">
          Navigation
        </p>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
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
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-bold transition cursor-pointer ${active
                    ? "bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs"
                    : "text-[#4B5563] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111318] dark:hover:text-[#F1F5F9]"
                  }`}
              >
                <Icon size={18} className={active ? "text-[#7E0E32] dark:text-[#FB7185]" : "text-[#6B7280] dark:text-[#64748B]"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Safety Tip Card */}
        <div className="rounded-2xl bg-[#7E0E32]/5 dark:bg-[#FB7185]/5 p-3.5 mt-3 border border-[#DEC4CB] dark:border-[#253146]">
          <p className="text-xs font-bold text-[#7E0E32] dark:text-[#FB7185] flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-[#7E0E32] dark:text-[#FB7185]" />
            Your Safety Companion
          </p>
          <p className="mt-1 text-[11px] leading-4 text-[#4B5563] dark:text-[#94A3B8]">
            Emergency helpline 112 is active 24/7. Stay connected.
          </p>
        </div>

        {/* User profile & Sign out */}
        {user && (
          <div className="mt-4 pt-3.5 border-t border-[#E8D7DC] dark:border-[#253146] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7E0E32] to-[#2D0B40] text-xs font-bold text-white shadow-xs">
                {(user.name || user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111318] dark:text-[#F1F5F9] truncate">
                  {user.name || user.fullName || "User"}
                </p>
                <p className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] truncate">
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
                className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

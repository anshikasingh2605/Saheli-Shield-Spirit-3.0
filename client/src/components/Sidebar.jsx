
import {
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  ScanSearch,
  Users,
  History,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({ page, setPage, open, setOpen }) {
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
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-600 p-2 text-white">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                SaheliShield
              </h1>
              <p className="text-xs text-slate-500">
                One shield for safety everywhere
              </p>
            </div>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="flex-1 space-y-1">
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
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-violet-50 p-4">
          <ShieldCheck className="mb-2 text-violet-700" size={23} />
          <p className="text-sm font-semibold text-slate-900">
            Your safety matters
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Stay aware, stay connected, and know where to get help.
          </p>
        </div>
      </aside>
    </>
  );
}

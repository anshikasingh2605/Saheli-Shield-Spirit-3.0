import { LogOut, Settings as SettingsIcon, ShieldCheck, AlertTriangle } from "lucide-react";

export default function Settings({ onLogout }) {
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to sign out of SaheliShield?");
    if (confirmed) onLogout?.();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <SettingsIcon size={27} />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-700">ACCOUNT</p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Settings</h2>
          </div>
        </div>
        <p className="mt-4 text-slate-500">Manage your SaheliShield account session.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-violet-700" size={23} />
          <div>
            <h3 className="font-semibold text-slate-900">Your account</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Sign out securely from this browser. You can sign in again whenever you need access.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={19} />
        <p className="text-sm leading-6 text-amber-900">
          Account deletion is not available because the current backend does not provide a delete-account API. This page therefore offers sign out only; it does not pretend to delete your account or data.
        </p>
      </div>
    </div>
  );
}

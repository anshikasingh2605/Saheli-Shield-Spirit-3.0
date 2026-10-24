import { LogOut, Settings as SettingsIcon, ShieldCheck, AlertTriangle } from "lucide-react";

export default function Settings({ onLogout }) {
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to sign out of SaheliShield?");
    if (confirmed) onLogout?.();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans-ui">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs shrink-0">
            <SettingsIcon size={25} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E0E32] dark:text-[#FB7185]">ACCOUNT</p>
            <h1 className="font-serif-editorial text-3xl font-bold text-[#111318] dark:text-[#F8FAFC] sm:text-4xl">Settings</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#6B7280] dark:text-[#94A3B8]">Manage your SaheliShield account session.</p>
      </section>

      <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-bold text-[#111318] dark:text-[#F8FAFC]">Your account</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-[#94A3B8]">
              Sign out securely from this browser. You can sign in again whenever you need access.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-5 py-2.5 text-xs font-bold text-red-700 dark:text-red-400 transition hover:bg-red-100/60 dark:hover:bg-red-950/40 sm:w-auto"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" size={18} />
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-300">
          Account deletion is not available because the current backend does not provide a delete-account API. This page therefore offers sign out only; it does not pretend to delete your account or data.
        </p>
      </div>
    </div>
  );
}


import { useState } from "react";
import {
  Settings as SettingsIcon,
  UserRound,
  Bell,
  ShieldCheck,
  Eye,
  LogOut,
  Info,
  Check,
} from "lucide-react";

export default function Settings() {
  const [name, setName] = useState("SaheliShield User");
  const [journeyAlerts, setJourneyAlerts] = useState(true);
  const [safetyTips, setSafetyTips] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [notice, setNotice] = useState("");

  function savePreferences(event) {
    event.preventDefault();
    setNotice("Demo preferences updated for this session only.");
  }

  function Toggle({ checked, onChange, label, description }) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="font-medium text-slate-800">{label}</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            checked ? "bg-violet-700" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <SettingsIcon size={27} />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-700">
              PERSONALIZE YOUR EXPERIENCE
            </p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Settings
            </h2>
          </div>
        </div>
        <p className="mt-4 text-slate-500">
          Manage your profile, notification preferences, and privacy options.
        </p>
      </section>

      <form onSubmit={savePreferences} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <UserRound className="text-violet-700" size={21} />
            <h3 className="font-semibold text-slate-900">Profile</h3>
          </div>

          <label
            htmlFor="profile-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Display name
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
          <p className="mt-2 text-xs text-slate-400">
            Demo profile only. Account details will come from the backend.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-2 flex items-center gap-3">
            <Bell className="text-violet-700" size={21} />
            <h3 className="font-semibold text-slate-900">
              Safety preferences
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            <Toggle
              checked={journeyAlerts}
              onChange={setJourneyAlerts}
              label="Journey alerts"
              description="Preference for journey status and overdue reminders."
            />
            <Toggle
              checked={safetyTips}
              onChange={setSafetyTips}
              label="Safety tips"
              description="Preference for digital and travel safety guidance."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-2 flex items-center gap-3">
            <Eye className="text-violet-700" size={21} />
            <h3 className="font-semibold text-slate-900">
              Privacy and data
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            <Toggle
              checked={privacyMode}
              onChange={setPrivacyMode}
              label="Privacy reminder"
              description="Remind me not to share passwords, OTPs, or banking PINs."
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck size={18} />
              Your safety data matters
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Only provide location access when needed. Avoid entering
              sensitive information into scam-check forms. Data retention
              and deletion controls will depend on the backend implementation.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
          >
            <Check size={18} />
            Save preferences
          </button>

          <button
            type="button"
            onClick={() =>
              setNotice(
                "Demo only: authentication is not connected, so no account was signed out."
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>

        {notice && (
          <p role="status" className="text-sm leading-6 text-slate-600">
            {notice}
          </p>
        )}
      </form>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-700" size={19} />
        <p className="text-sm leading-6 text-amber-900">
          These are prototype preferences. They are not persisted after a
          page reload and do not enable or disable real notifications.
        </p>
      </div>
    </div>
  );
}

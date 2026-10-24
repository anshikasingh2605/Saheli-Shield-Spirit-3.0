
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Navigation,
  Users,
  Clock3,
  PhoneCall,
  Lock,
  ChevronRight,
} from "lucide-react";

export default function Dashboard({ setPage }) {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/50 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Personal Shield Active • 24/7 Companion
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Safety starts with you.
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Plan your journeys along well-lit, verified corridors, screen suspicious messages with AI, and keep your emergency circle within reach.
            </p>
          </div>

          {/* Quick Actions in Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPage("contacts")}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-800"
            >
              <Users size={15} className="text-violet-600 transition group-hover:scale-110" />
              Trusted Contacts
            </button>
            <button
              type="button"
              onClick={() => setPage("history")}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-800"
            >
              <Clock3 size={15} className="text-slate-500 transition group-hover:scale-110" />
              Activity Log
            </button>
          </div>
        </div>
      </section>

      {/* Main Core Safety Tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Core Safety Tools
            </h3>
            <p className="text-sm text-slate-500">
              Select a tool to start navigating or analyzing threats.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* SaheliRoute Card */}
          <div
            onClick={() => setPage("route")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-inner transition duration-300 group-hover:bg-violet-600 group-hover:text-white group-hover:scale-105">
                    <Navigation size={26} />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                      Smart Safe Navigation
                    </span>
                    <h4 className="mt-1 text-2xl font-bold text-slate-900 group-hover:text-violet-700 transition">
                      SaheliRoute
                    </h4>
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-violet-100 group-hover:text-violet-700">
                  <ChevronRight size={20} className="transition group-hover:translate-x-0.5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Plan your journey with live safety scores, illuminated path prioritization, safe checkpoint guidance, and live location broadcasting to your emergency circle.
              </p>

              {/* Feature Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <MapPin size={12} className="text-violet-600" />
                  Illuminated Corridors
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <Lock size={12} className="text-violet-600" />
                  Live GPS Sharing
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <Sparkles size={12} className="text-violet-600" />
                  Safety Score
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-xs font-medium text-slate-500">
                Ready to plan a route
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                Open route planner
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* ScamSaathi Card */}
          <div
            onClick={() => setPage("scam")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner transition duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      AI Threat Detection
                    </span>
                    <h4 className="mt-1 text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      ScamSaathi
                    </h4>
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
                  <ChevronRight size={20} className="transition group-hover:translate-x-0.5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Screen suspicious SMS, WhatsApp offers, fake parcel delivery alerts, lottery claims, and suspicious UPI payment links using real-time AI security analysis.
              </p>

              {/* Feature Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <Sparkles size={12} className="text-emerald-600" />
                  AI Threat Analysis
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <Lock size={12} className="text-emerald-600" />
                  URL & SMS Screening
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <ShieldAlert size={12} className="text-emerald-600" />
                  Fraud Prevention
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-xs font-medium text-slate-500">
                Ready to inspect messages
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                Check a message
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Security Advisory Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/40 to-yellow-50/50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-sm">
              <ShieldAlert size={20} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-950">
                Safety & Security Advisory
              </p>
              <p className="text-xs leading-relaxed text-amber-900/90 sm:text-sm">
                Never share your OTP, UPI PIN, or banking passwords with anyone. While ScamSaathi analyzes digital threats, always trust your instincts and call emergency services if you ever feel unsafe.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs transition hover:bg-amber-100"
            >
              <PhoneCall size={13} className="text-rose-600" />
              SOS: 112
            </a>
            <a
              href="tel:1091"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs transition hover:bg-amber-100"
            >
              <PhoneCall size={13} className="text-purple-600" />
              Helpline: 1091
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

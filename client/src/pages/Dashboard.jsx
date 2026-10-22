
import {
  ArrowUpRight,
  MapPin,
  ShieldAlert,
  Users,
  Clock3,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-xl bg-violet-50 p-3 text-violet-700">
          <Icon size={22} />
        </span>
        <ArrowUpRight size={18} className="text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export default function Dashboard({ setPage }) {
  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-violet-700">
          YOUR PERSONAL SAFETY SPACE
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Safety starts with you.
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          Plan your journey, check suspicious messages, and keep your
          trusted contacts within reach.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="Journey status"
          value="Not started"
          note="No active journey in this demo"
        />
        <StatCard
          icon={ShieldAlert}
          label="Scam checks"
          value="Ready"
          note="Analyze a suspicious message"
        />
        <StatCard
          icon={Users}
          label="Trusted contacts"
          value="Not connected"
          note="Connect your backend to load contacts"
        />
        <StatCard
          icon={Clock3}
          label="Recent activity"
          value="No records"
          note="Your history will appear here"
        />
      </section>

      <section>
        <h3 className="text-xl font-bold text-slate-900">
          Your safety tools
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose a tool to get started.
        </p>

        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <button
            onClick={() => setPage("route")}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <MapPin size={25} />
              </span>
              <ChevronRight
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </div>
            <h4 className="mt-5 text-xl font-bold text-slate-900">
              SaheliRoute
            </h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Plan a journey, review available routes, and access journey
              safety features.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
              Open route planner <ArrowUpRight size={16} />
            </span>
          </button>

          <button
            onClick={() => setPage("scam")}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck size={25} />
              </span>
              <ChevronRight
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </div>
            <h4 className="mt-5 text-xl font-bold text-slate-900">
              ScamSaathi
            </h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Check suspicious messages, URLs, job offers, and payment
              requests for potential warning signs.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              Check a suspicious message <ArrowUpRight size={16} />
            </span>
          </button>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={21} />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Safety reminder
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Never share your OTP, password, or banking PIN with anyone.
            Scam analysis can help identify warning signs, but it cannot
            guarantee that a message is safe.
          </p>
        </div>
      </section>
    </div>
  );
}

import {
  MapPin,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Users,
  Bell,
  Sparkles,
  ArrowRight,
  MessageSquareText,
  Search,
  Share2,
  Lightbulb,
  PhoneCall,
  Eye,
} from "lucide-react";

export default function Dashboard({ setPage, user }) {
  const name = user?.name || user?.fullName || "";
  const firstName = name ? name.split(" ")[0] : "Friend";

  return (
    <div className="space-y-8">
      {/* Header Greeting Banner */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-2.5">
            Hello, {firstName}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Plan safer journeys, stay alert online, and be part of a supportive community — all in one place.
          </p>
        </div>
        <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-1.5 text-xs font-semibold text-purple-800 self-start sm:self-center shadow-xs">
          <Sparkles size={13} className="text-purple-600" />
          Safer Paths • Brighter Tomorrows
        </div>
      </section>

      {/* Main Two Hero Cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* ========================================================= */}
        {/* Card 1: SaheliRoute */}
        {/* ========================================================= */}
        <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 sm:p-7 shadow-sm transition hover:shadow-lg hover:border-purple-200">
          <div>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm shrink-0">
                  <MapPin size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    SaheliRoute
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Plan your journey with safety in mind.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage("route")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition shadow-xs"
                aria-label="Open SaheliRoute"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Body 2-Column Section */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 items-center">
              {/* Left Graphic: Stylized Route Map Card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-purple-50/30 to-purple-100/20 p-4 aspect-4/3 flex flex-col justify-between shadow-xs">
                {/* Stylized Map Grid Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:14px_14px]" />

                {/* SVG Route Illustration */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 150" fill="none">
                  {/* Subtle City Streets */}
                  <path d="M10 40 L190 40 M40 10 L40 140 M160 10 L160 140 M10 110 L190 110" stroke="#E2E8F0" strokeWidth="2.5" />

                  {/* Safe Route Path */}
                  <path
                    d="M 35 115 C 60 115, 70 50, 105 75 C 135 95, 145 40, 165 40"
                    stroke="#9333EA"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="1 0"
                  />
                  {/* Glowing halo */}
                  <path
                    d="M 35 115 C 60 115, 70 50, 105 75 C 135 95, 145 40, 165 40"
                    stroke="#C084FC"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.3"
                  />

                  {/* Start Point Pin */}
                  <circle cx="35" cy="115" r="7" fill="#9333EA" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="35" cy="115" r="2.5" fill="#FFFFFF" />

                  {/* Waypoint Shield Badge */}
                  <g transform="translate(97, 67)">
                    <circle cx="8" cy="8" r="10" fill="#9333EA" />
                    <path d="M8 4 L13 6 C13 11 10.5 13.5 8 15 C5.5 13.5 3 11 3 6 Z" fill="#FFFFFF" />
                  </g>

                  {/* Destination Pin */}
                  <circle cx="165" cy="40" r="7" fill="#7E22CE" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="165" cy="40" r="2.5" fill="#FFFFFF" />
                </svg>

                {/* Status Badge Over Map */}
                <div className="relative z-10 self-start rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-purple-900 shadow-xs border border-purple-100 flex items-center gap-1.5 backdrop-blur-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Verified Safe Corridor
                </div>

                <div className="relative z-10 self-end rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-xs border border-slate-100">
                  Live GPS Safe Nav
                </div>
              </div>

              {/* Right: Feature Bullet List */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <Navigation size={14} />
                  </div>
                  <span className="font-medium">Find safer routes</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="font-medium">Check route risk level</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <Share2 size={14} />
                  </div>
                  <span className="font-medium">Share live location</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <PhoneCall size={14} />
                  </div>
                  <span className="font-medium">Alert trusted contacts in emergency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPage("route")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-purple-800 transition active:scale-[0.99]"
            >
              Plan a Journey
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Card 2: ScamSaathi */}
        {/* ========================================================= */}
        <div className="flex flex-col justify-between rounded-3xl border border-emerald-100 bg-white p-6 sm:p-7 shadow-sm transition hover:shadow-lg hover:border-emerald-200">
          <div>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm shrink-0">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    ScamSaathi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Check messages, links or job offers before you trust.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage("scam")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                aria-label="Open ScamSaathi"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Body 2-Column Section */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 items-center">
              {/* Left Graphic: Stylized Smartphone & Scam Alert Card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-4 aspect-4/3 flex flex-col justify-between shadow-xs">
                {/* Stylized Phone Frame */}
                <div className="mx-auto w-full max-w-[170px] rounded-2xl border-2 border-slate-300 bg-white p-2.5 shadow-md">
                  {/* Phone Speaker Notch */}
                  <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-slate-300" />

                  {/* Suspicious Chat Bubble Mockup */}
                  <div className="rounded-xl bg-slate-100 p-2 text-[10px] text-slate-800 leading-snug">
                    <p className="font-semibold text-slate-900">Hey! You&apos;ve won a prize!</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Click here: http://win-prize.xyz</p>
                  </div>

                  {/* AI Warning Alert Pill */}
                  <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-800 shadow-xs flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold leading-tight">Potentially Suspicious</p>
                      <p className="text-[8px] text-rose-600 leading-tight">Risk Level: High</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 self-center rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-xs border border-emerald-100 mt-2">
                  AI Threat Shield Active
                </div>
              </div>

              {/* Right: Feature Bullet List */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <MessageSquareText size={14} />
                  </div>
                  <span className="font-medium">Detect suspicious messages and links</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Search size={14} />
                  </div>
                  <span className="font-medium">Analyze job offers, websites or QR codes</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Eye size={14} />
                  </div>
                  <span className="font-medium">Learn about common digital scams</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Lightbulb size={14} />
                  </div>
                  <span className="font-medium">Get actionable safety tips</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPage("scam")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-[0.99]"
            >
              Check Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Section: How SaheliShield Helps */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-purple-700" />
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            How SaheliShield Helps
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Item 1 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-purple-200 hover:shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Travel Safely</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Plan, track and share your journey.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-purple-200 hover:shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <Bell size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Stay Alert</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Identify and avoid online scams.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-purple-200 hover:shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Users size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Support Community</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Share and get real-time safety updates.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-purple-200 hover:shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Be Empowered</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Make informed and confident decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

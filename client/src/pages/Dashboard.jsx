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
    <div className="space-y-8 font-sans-ui">
      {/* Header Greeting Banner */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif-editorial text-3xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC] sm:text-4xl lg:text-5xl flex items-center gap-2.5">
            Hello, <span className="text-[#7E0E32] dark:text-[#FB7185]">{firstName}</span>
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-[#4B5563] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
            Plan safer journeys, stay alert online, and be part of a supportive community — all in one place.
          </p>
        </div>
        <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/95 dark:bg-[#161D2B]/95 px-4 py-1.5 text-xs font-bold text-[#7E0E32] dark:text-[#FB7185] self-start sm:self-center shadow-xs backdrop-blur-sm">
          <Sparkles size={13} className="text-[#7E0E32] dark:text-[#FB7185]" />
          Safer Paths • Brighter Tomorrows
        </div>
      </section>

      {/* Main Two Hero Cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* ========================================================= */}
        {/* Card 1: SaheliRoute */}
        {/* ========================================================= */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-6 sm:p-7 shadow-xs transition hover:shadow-md hover:border-[#7E0E32]/30 dark:hover:border-[#FB7185]/30">
          <div>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs shrink-0">
                  <MapPin size={26} />
                </div>
                <div>
                  <h3 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F1F5F9]">
                    SaheliRoute
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8]">
                    Plan your journey with safety in mind.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage("route")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] hover:bg-[#7E0E32] hover:text-white transition shadow-2xs cursor-pointer"
                aria-label="Open SaheliRoute"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Body 2-Column Section */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 items-center">
              {/* Left Graphic: Stylized Route Map Card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-gradient-to-br from-[#FFF9F5] dark:from-[#0B0E14] via-[#FCE7E8]/30 dark:via-[#7E0E32]/10 to-[#7E0E32]/10 p-4 aspect-4/3 flex flex-col justify-between shadow-2xs">
                {/* Stylized Map Grid Lines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#7E0E32_1px,transparent_1px)] dark:bg-[radial-gradient(#FB7185_1px,transparent_1px)] [background-size:14px_14px]" />

                {/* SVG Route Illustration */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 150" fill="none">
                  {/* Subtle City Streets */}
                  <path d="M10 40 L190 40 M40 10 L40 140 M160 10 L160 140 M10 110 L190 110" stroke="#DEC4CB" strokeWidth="2" strokeOpacity="0.5" />

                  {/* Safe Route Path */}
                  <path
                    d="M 35 115 C 60 115, 70 50, 105 75 C 135 95, 145 40, 165 40"
                    stroke="#7E0E32"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Glowing halo */}
                  <path
                    d="M 35 115 C 60 115, 70 50, 105 75 C 135 95, 145 40, 165 40"
                    stroke="#FB7185"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.3"
                  />

                  {/* Start Point Pin */}
                  <circle cx="35" cy="115" r="7" fill="#7E0E32" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="35" cy="115" r="2.5" fill="#FFFFFF" />

                  {/* Waypoint Shield Badge */}
                  <g transform="translate(97, 67)">
                    <circle cx="8" cy="8" r="10" fill="#7E0E32" />
                    <path d="M8 4 L13 6 C13 11 10.5 13.5 8 15 C5.5 13.5 3 11 3 6 Z" fill="#FFFFFF" />
                  </g>

                  {/* Destination Pin */}
                  <circle cx="165" cy="40" r="7" fill="#5D0A24" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="165" cy="40" r="2.5" fill="#FFFFFF" />
                </svg>

                {/* Status Badge Over Map */}
                <div className="relative z-10 self-start rounded-full bg-white/95 dark:bg-[#161D2B]/95 px-3 py-1 text-[10px] font-bold text-[#7E0E32] dark:text-[#FB7185] shadow-xs border border-[#DEC4CB] dark:border-[#253146] flex items-center gap-1.5 backdrop-blur-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Verified Safe Corridor
                </div>

                <div className="relative z-10 self-end rounded-full bg-white/95 dark:bg-[#161D2B]/95 px-2.5 py-0.5 text-[10px] font-bold text-[#4B5563] dark:text-[#94A3B8] shadow-xs border border-[#DEC4CB] dark:border-[#253146]">
                  Live GPS Safe Nav
                </div>
              </div>

              {/* Right: Feature Bullet List */}
              <div className="space-y-3.5 text-xs sm:text-sm text-[#111318] dark:text-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                    <Navigation size={14} />
                  </div>
                  <span className="font-semibold">Find safer routes</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="font-semibold">Check route risk level</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                    <Share2 size={14} />
                  </div>
                  <span className="font-semibold">Share live location</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                    <PhoneCall size={14} />
                  </div>
                  <span className="font-semibold">Alert trusted contacts in emergency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-6 pt-5 border-t border-[#E8D7DC] dark:border-[#253146]">
            <button
              type="button"
              onClick={() => setPage("route")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#7E0E32]/20 transition active:scale-[0.99] cursor-pointer"
            >
              Plan a Journey
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Card 2: ScamSaathi */}
        {/* ========================================================= */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-6 sm:p-7 shadow-xs transition hover:shadow-md hover:border-[#0D9488]/30 dark:hover:border-[#2DD4BF]/30">
          <div>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF] shadow-2xs shrink-0">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F1F5F9]">
                    ScamSaathi
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8]">
                    Check messages, links or job offers before you trust.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage("scam")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF] hover:bg-[#0D9488] hover:text-white transition shadow-2xs cursor-pointer"
                aria-label="Open ScamSaathi"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Body 2-Column Section */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 items-center">
              {/* Left Graphic: Stylized Smartphone & Scam Alert Card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-gradient-to-br from-[#FFF9F5] dark:from-[#0B0E14] via-[#0D9488]/5 to-[#0D9488]/15 p-4 aspect-4/3 flex flex-col justify-between shadow-2xs">
                {/* Stylized Phone Frame */}
                <div className="mx-auto w-full max-w-[170px] rounded-2xl border-2 border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-2.5 shadow-md">
                  {/* Phone Speaker Notch */}
                  <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[#DEC4CB] dark:bg-[#253146]" />

                  {/* Suspicious Chat Bubble Mockup */}
                  <div className="rounded-xl bg-[#FFF9F5] dark:bg-[#0B0E14] border border-[#E8D7DC] dark:border-[#253146] p-2 text-[10px] text-[#111318] dark:text-[#F1F5F9] leading-snug">
                    <p className="font-bold text-[#111318] dark:text-[#F1F5F9]">Hey! You&apos;ve won a prize!</p>
                    <p className="text-[9px] text-rose-600 dark:text-rose-400 mt-0.5">Click here: http://win-prize.xyz</p>
                  </div>

                  {/* AI Warning Alert Pill */}
                  <div className="mt-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-800 dark:text-rose-300 shadow-2xs flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold leading-tight">Potentially Suspicious</p>
                      <p className="text-[8px] text-rose-600 dark:text-rose-400 leading-tight">Risk Level: High</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 self-center rounded-full bg-white/95 dark:bg-[#161D2B]/95 px-3 py-0.5 text-[10px] font-bold text-[#0D9488] dark:text-[#2DD4BF] shadow-xs border border-[#DEC4CB] dark:border-[#253146] mt-2">
                  AI Threat Shield Active
                </div>
              </div>

              {/* Right: Feature Bullet List */}
              <div className="space-y-3.5 text-xs sm:text-sm text-[#111318] dark:text-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
                    <MessageSquareText size={14} />
                  </div>
                  <span className="font-semibold">Detect suspicious messages and links</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
                    <Search size={14} />
                  </div>
                  <span className="font-semibold">Analyze job offers, websites or QR codes</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
                    <Eye size={14} />
                  </div>
                  <span className="font-semibold">Learn about common digital scams</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
                    <Lightbulb size={14} />
                  </div>
                  <span className="font-semibold">Get actionable safety tips</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-6 pt-5 border-t border-[#E8D7DC] dark:border-[#253146]">
            <button
              type="button"
              onClick={() => setPage("scam")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-3 text-sm font-bold shadow-md shadow-[#0D9488]/20 transition active:scale-[0.99] cursor-pointer"
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
          <span className="h-5 w-1.5 rounded-full bg-[#7E0E32] dark:bg-[#FB7185]" />
          <h3 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC]">
            How SaheliShield Helps
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Item 1 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-xs transition hover:border-[#7E0E32]/30 dark:hover:border-[#FB7185]/30">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-serif-editorial text-base font-bold text-[#111318] dark:text-[#F1F5F9]">Travel Safely</h4>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] leading-normal">
                Plan, track and share your journey.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-xs transition hover:border-[#7E0E32]/30 dark:hover:border-[#FB7185]/30">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
              <Bell size={22} />
            </div>
            <div>
              <h4 className="font-serif-editorial text-base font-bold text-[#111318] dark:text-[#F1F5F9]">Stay Alert</h4>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] leading-normal">
                Identify and avoid online scams.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-xs transition hover:border-[#7E0E32]/30 dark:hover:border-[#FB7185]/30">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
              <Users size={22} />
            </div>
            <div>
              <h4 className="font-serif-editorial text-base font-bold text-[#111318] dark:text-[#F1F5F9]">Support Community</h4>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] leading-normal">
                Share and get real-time safety updates.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-xs transition hover:border-[#0D9488]/30 dark:hover:border-[#2DD4BF]/30">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-serif-editorial text-base font-bold text-[#111318] dark:text-[#F1F5F9]">Be Empowered</h4>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] leading-normal">
                Make informed and confident decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

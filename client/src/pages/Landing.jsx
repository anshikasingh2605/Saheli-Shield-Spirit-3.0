import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Navigation,
  Users,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Moon,
  Sun,
  X,
  Menu,
  ChevronDown,
} from "lucide-react";

export default function Landing({ onGetStarted }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("sahelishield_theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    try {
      document.documentElement.classList.add("theme-transition");
    } catch {}
    setDarkMode(next);
    try {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("sahelishield_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("sahelishield_theme", "light");
      }
    } catch {}
    window.setTimeout(() => {
      try {
        document.documentElement.classList.remove("theme-transition");
      } catch {}
    }, 500);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "features", label: "Features" },
    { id: "community", label: "Community" },
    { id: "impact", label: "Impact" },
    { id: "faq", label: "FAQ" },
  ];

  useEffect(() => {
    const sectionIds = ["home", "about", "features", "community", "impact", "faq"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTab, setDemoTab] = useState("route"); // "route" | "scam"
  const [activeFaq, setActiveFaq] = useState(0);

  // Demo simulator state
  const [demoStart, setDemoStart] = useState("Hauz Khas Metro");
  const [demoDest, setDemoDest] = useState("Green Park Extension");
  const [demoRouteCalculated, setDemoRouteCalculated] = useState(false);

  const [demoScamText, setDemoScamText] = useState(
    "URGENT: Your bank account will be blocked today! Click http://sbi-kyc-verify-portal.top to update PAN immediately."
  );
  const [demoScamAnalyzed, setDemoScamAnalyzed] = useState(false);

  const faqItems = [
    {
      q: "How does SaheliRoute calculate safe paths?",
      a: "SaheliRoute synthesizes verified street lighting data, crowd density metrics, police assistance booths, and validated community reports to guide travelers along well-lit, active, and monitored corridors rather than isolated shortcuts.",
    },
    {
      q: "How does ScamSaathi analyze suspicious messages?",
      a: "ScamSaathi inspects URL domain registration age, linguistic phishing indicators, unauthorized banking request patterns, and known job fraud schemes using client-assisted AI to deliver instant, understandable safety verdicts.",
    },
    {
      q: "Is my live location stored on external servers?",
      a: "No. Your live journey location is only shared peer-to-peer with the trusted contacts you explicitly designate. When you reach your destination or end tracking, active broadcasting ceases immediately.",
    },
    {
      q: "Can I use SaheliShield in any city?",
      a: "Yes. ScamSaathi functions globally across any language, and SaheliRoute supports safe routing in 20+ major metropolitan cities with active community sentinel updates.",
    },
    {
      q: "Is SaheliShield free for students and solo travelers?",
      a: "Yes. Core personal travel safety, SOS alerts, and digital fraud analysis are completely free as part of our public safety mission.",
    },
  ];

  return (
    <div className={`min-h-screen font-sans-ui transition-colors duration-200 ${darkMode ? "dark bg-[#0B0E14] text-[#F1F5F9]" : "bg-[#FFF9F5] text-[#111318]"}`}>
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8D7DC] dark:border-[#1E293B] bg-[#FFF9F5]/95 dark:bg-[#0B0E14]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 sm:h-[72px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo with Exact SaheliShield Image */}
          <a
            href="#home"
            onClick={() => setActiveSection("home")}
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
          >
            <img
              src="/logo.png"
              alt="SaheliShield Official Shield Logo"
              className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-xl object-contain shadow-xs ring-1 ring-[#7E0E32]/10 dark:ring-white/10 shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-serif-editorial text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-[#7E0E32] dark:text-[#FB7185] leading-none select-none">
              Saheli<span className="text-[#111318] dark:text-[#F1F5F9]">Shield</span>
            </span>
          </a>

          {/* Center Navigation Links (Pill Container) */}
          <nav className="hidden lg:inline-flex items-center gap-1 rounded-full px-5 py-2 text-xs font-bold shadow-xs border border-[#E2CFD5] dark:border-[#253146] bg-white dark:bg-[#161D2B] text-[#2D3748] dark:text-[#94A3B8] transition-colors">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setActiveSection(link.id)}
                  className={`relative px-3.5 py-1 transition hover:text-[#7E0E32] dark:hover:text-[#FB7185] ${
                    isActive
                      ? "text-[#7E0E32] dark:text-[#FB7185] font-extrabold"
                      : ""
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#7E0E32] dark:bg-[#FB7185]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Theme Toggle Button with Clear Visual Indicator */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B] p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold shadow-2xs transition hover:border-[#7E0E32] dark:hover:border-[#FB7185] cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  darkMode
                    ? "bg-[#7E0E32] text-amber-300"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {darkMode ? (
                  <Moon size={13} className="fill-current text-amber-300" />
                ) : (
                  <Sun size={13} className="fill-current text-amber-500" />
                )}
              </div>
              <span className="hidden sm:inline font-extrabold text-[#2D3748] dark:text-[#F1F5F9] text-xs">
                {darkMode ? "Dark" : "Light"}
              </span>
            </button>

            {/* Primary Get Started CTA */}
            <button
              type="button"
              onClick={onGetStarted}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#7E0E32]/20 transition active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={14} className="text-white" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-[#DEC4CB] dark:border-[#253146] p-2 text-[#111318] dark:text-[#F1F5F9] lg:hidden hover:bg-white dark:hover:bg-[#1E293B] cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-[#E8D7DC] dark:border-[#1E293B] bg-white/98 dark:bg-[#161D2B]/98 backdrop-blur-md px-5 sm:px-6 py-4 lg:hidden shadow-xl transition-all">
            <div className="flex flex-col space-y-1 text-sm font-bold text-[#2D3748] dark:text-[#CBD5E1]">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => {
                      setActiveSection(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] font-extrabold"
                        : "hover:bg-[#FFF9F5] dark:hover:bg-[#1E293B] hover:text-[#7E0E32] dark:hover:text-[#FB7185]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7E0E32] dark:bg-[#FB7185]" />
                    )}
                  </a>
                );
              })}

              {/* Mobile Appearance Toggle Row */}
              <div className="flex items-center justify-between border-t border-[#E8D7DC] dark:border-[#253146] pt-3 mt-2 px-1">
                <span className="text-xs font-bold text-[#4B5563] dark:text-[#94A3B8]">
                  Appearance
                </span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-slate-100 dark:bg-[#0B0E14] px-3.5 py-1.5 text-xs font-bold text-[#111318] dark:text-[#F1F5F9] cursor-pointer"
                >
                  {darkMode ? (
                    <>
                      <Moon size={14} className="text-[#FB7185]" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun size={14} className="text-amber-500" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Get Started CTA */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGetStarted();
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] py-3 text-center text-sm font-bold text-white shadow-md shadow-[#7E0E32]/25 transition active:scale-98 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — HIGH CONTRAST EDITORIAL COMPOSITION */}
      {/* ========================================================================= */}
      <section id="home" className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24 scroll-mt-20">
        {/* Soft atmospheric gradient */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#FCE7E8]/70 dark:from-[#7E0E32]/30 via-[#F36F82]/10 dark:via-[#9B123E]/10 to-transparent blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Center Editorial Headline */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B]/90 px-4 py-1.5 shadow-sm backdrop-blur-xs mb-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
              <img
                src="/logo.png"
                alt="SaheliShield Official Shield Emblem"
                className="h-5 w-5 object-contain"
              />
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#7E0E32] dark:text-[#FB7185]">
                One Shield. Two Real-World Problems.
              </span>
            </div>

            <h1 className="font-serif-editorial text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08] text-[#111318] dark:text-[#F8FAFC]">
              <span className="text-[#840D34] dark:text-[#FB7185]">Safer</span> Journeys.{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#840D34] dark:text-[#FB7185]">Smarter</span> Decisions.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#374151] dark:text-[#94A3B8] font-medium max-w-2xl mx-auto leading-relaxed">
              An integrated platform for travel safety, scam awareness, and a more informed community — for everyone, everywhere.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#7E0E32]/30 transition active:scale-95 group"
              >
                <span>Explore SaheliShield</span>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-7 py-3.5 text-sm sm:text-base font-bold text-[#181A20] dark:text-[#F1F5F9] shadow-xs hover:border-[#7E0E32]/50 hover:bg-[#FFF9F5] dark:hover:bg-[#1E293B] transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FCE7E8] dark:bg-rose-950/80 text-[#7E0E32] dark:text-[#FB7185]">
                  <Play size={13} className="fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
                <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] font-semibold">2 min</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. FLOATING FEATURE STRIP (PILL CONTAINER) */}
          {/* ========================================================================= */}
          <div className="mt-12 lg:mt-16">
            <div className="mx-auto max-w-5xl rounded-3xl p-5 shadow-lg border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-colors">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-rose-500/20 text-[#7E0E32] dark:text-[#FB7185]">
                  <MapPin size={21} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#111318] dark:text-[#F8FAFC] leading-tight">
                    Plan & Track
                  </p>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">
                    Safe Journeys
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <Lock size={21} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#111318] dark:text-[#F8FAFC] leading-tight">
                    Detect & Avoid
                  </p>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">
                    Online Scams
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
                  <Users size={21} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#111318] dark:text-[#F8FAFC] leading-tight">
                    Community
                  </p>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">
                    Safety Insights
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  <Sparkles size={21} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#111318] dark:text-[#F8FAFC] leading-tight">
                    Learn & Be
                  </p>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">
                    Empowered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REAL PROBLEMS. REAL SOLUTIONS. SECTION */}
      {/* ========================================================================= */}
      <section id="about" className="py-16 sm:py-24 border-t border-[#E8D7DC] dark:border-[#1E293B] transition-colors scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Clean Thoughtful Woman Visual (No obstructing span elements) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#DEC4CB] dark:border-[#253146] shadow-xl bg-slate-900 aspect-square max-w-md mx-auto group">
                <img
                  src="/landing/thoughtful-person.jpg"
                  alt="A thoughtful woman navigating decisions on her smartphone"
                  className="h-full w-full object-cover filter contrast-105 transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Section Headline + Two Product Showcase Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <h2 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC] leading-tight">
                  Real Problems. <br />
                  <span className="text-[#840D34] dark:text-[#FB7185]">Real Solutions.</span>
                </h2>

                <p className="mt-4 text-base sm:text-lg text-[#374151] dark:text-[#94A3B8] font-medium max-w-xl leading-relaxed">
                  Whether you&apos;re on the move or online, SaheliShield helps you make safer, smarter and more confident decisions.
                </p>

                {/* Slider / Page Indicator dots */}
                <div className="mt-5 flex items-center gap-1.5">
                  <span className="h-2 w-7 rounded-full bg-[#7E0E32] dark:bg-[#FB7185]" />
                  <span className="h-2 w-2 rounded-full bg-[#DEC4CB] dark:bg-[#253146]" />
                  <span className="h-2 w-2 rounded-full bg-[#DEC4CB] dark:bg-[#253146]" />
                </div>
              </div>

              {/* Two Product Cards Side by Side with Animated Screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Product Card 1: SaheliRoute with Live Animated Navigation Screen */}
                <div
                  onClick={() => {
                    setDemoTab("route");
                    setDemoModalOpen(true);
                  }}
                  className="group cursor-pointer rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-sm transition hover:shadow-xl hover:border-[#7E0E32]/50 dark:hover:border-[#FB7185]/50"
                >
                  {/* Animated Live SaheliRoute Safe Navigation Screen */}
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#0F172A] to-[#1E293B] p-3 text-white shadow-inner border border-slate-700/60 flex flex-col justify-between">
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>LIVE SAFE CORRIDOR</span>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-extrabold text-emerald-300 border border-emerald-500/30">
                        94% Safety Score
                      </span>
                    </div>

                    {/* Animated Micro-Map Viewport */}
                    <div className="relative h-26 w-full rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

                      {/* SVG Animated Route */}
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 90" fill="none">
                        {/* Street Roads */}
                        <path d="M 0 25 L 240 25 M 0 65 L 240 65 M 70 0 L 70 90 M 170 0 L 170 90" stroke="#334155" strokeWidth="3" opacity="0.6" />

                        {/* Glowing Safe Corridor (Animated dashed flow) */}
                        <path
                          d="M 30 70 C 60 70, 70 25, 120 45 C 160 65, 180 25, 210 25"
                          stroke="#F43F5E"
                          strokeWidth="7"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        <path
                          d="M 30 70 C 60 70, 70 25, 120 45 C 160 65, 180 25, 210 25"
                          stroke="url(#screenRouteGrad)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray="6 4"
                          className="animate-route-dash"
                        />

                        <defs>
                          <linearGradient id="screenRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#14B8A6" />
                            <stop offset="50%" stopColor="#FB7185" />
                            <stop offset="100%" stopColor="#FBBF24" />
                          </linearGradient>
                        </defs>

                        {/* Origin Point */}
                        <circle cx="30" cy="70" r="5" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />

                        {/* Destination Point */}
                        <circle cx="210" cy="25" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>

                      {/* Animated Moving GPS Locator Pin with Radar Ping */}
                      <div className="absolute top-[42px] left-[115px] -translate-x-1/2 -translate-y-1/2">
                        <span className="animate-radar-ping absolute inline-flex h-8 w-8 -top-2 -left-2 rounded-full bg-cyan-400 opacity-60" />
                        <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-md">
                          <Navigation size={9} className="rotate-45 fill-current" />
                        </div>
                      </div>

                      {/* Police Assistance Booth Flag */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-slate-900/90 px-1.5 py-0.5 text-[8px] font-bold text-sky-300 border border-sky-500/30">
                        <ShieldCheck size={9} />
                        <span>Police Booth: 120m</span>
                      </div>
                    </div>

                    {/* Bottom Mini Metrics Overlay */}
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Well-Lit Commercial Avenue
                      </span>
                      <span className="font-mono font-bold text-rose-300">14 min • 4.8 km</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7E0E32] text-white shadow-xs">
                        <MapPin size={21} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#111318] dark:text-[#F8FAFC]">
                          SaheliRoute
                        </h3>
                        <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-semibold">
                          Plan. Track. Stay Safe.
                        </p>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1E293B] text-[#111318] dark:text-[#F1F5F9] group-hover:bg-[#7E0E32] dark:group-hover:bg-[#9B123E] group-hover:text-white transition shadow-2xs">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Product Card 2: ScamSaathi with Live Animated Threat Analysis Screen */}
                <div
                  onClick={() => {
                    setDemoTab("scam");
                    setDemoModalOpen(true);
                  }}
                  className="group cursor-pointer rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 shadow-sm transition hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-500/50"
                >
                  {/* Animated Live ScamSaathi Threat Analysis Screen */}
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F19] via-[#120B18] to-[#0A0D14] p-3 text-white shadow-inner border border-rose-900/40 flex flex-col justify-between">
                    {/* Top Threat Scanner Header */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-extrabold text-rose-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                        </span>
                        <span>AI THREAT RADAR ACTIVE</span>
                      </div>
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-extrabold text-rose-300 border border-rose-500/40 font-mono">
                        THREAT: 98%
                      </span>
                    </div>

                    {/* Animated Scanning Viewport with Laser Beam */}
                    <div className="relative h-26 w-full rounded-xl overflow-hidden bg-slate-950/90 border border-rose-900/30 p-2.5 flex flex-col justify-between">
                      {/* Cyber grid lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:14px_14px] opacity-25" />

                      {/* Animated Laser Scanning Beam */}
                      <div className="animate-scan-beam absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_8px_#F43F5E] pointer-events-none" />

                      {/* Simulated Suspicious Message Bubble */}
                      <div className="relative z-10 flex items-center justify-between rounded-lg bg-slate-900/90 px-2 py-1 border border-slate-800 text-[10px]">
                        <span className="truncate max-w-[170px] text-slate-200 font-mono">
                          Claim ₹45k job payout: bit.ly/claim-99x
                        </span>
                        <span className="text-[9px] font-bold text-rose-400 shrink-0">Phishing</span>
                      </div>

                      {/* Real-Time Detection Flags */}
                      <div className="relative z-10 flex items-center gap-1.5 text-[9px] font-semibold">
                        <span className="rounded bg-rose-950/80 text-rose-300 border border-rose-800/50 px-1.5 py-0.5 flex items-center gap-1">
                          <AlertTriangle size={9} /> Fake Domain
                        </span>
                        <span className="rounded bg-rose-950/80 text-rose-300 border border-rose-800/50 px-1.5 py-0.5 flex items-center gap-1">
                          <Lock size={9} /> Advance Fee
                        </span>
                      </div>
                    </div>

                    {/* Bottom Scanner Action Status */}
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium pt-1">
                      <span className="flex items-center gap-1 text-rose-300 font-bold">
                        <ShieldAlert size={12} className="text-rose-400" />
                        Verdict: Fraudulent Link Detected
                      </span>
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/50">
                        BLOCKED
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-[#7E0E32] text-white shadow-xs">
                        <ShieldAlert size={21} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#111318] dark:text-[#F8FAFC]">
                          ScamSaathi
                        </h3>
                        <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-semibold">
                          Check. Analyze. Stay Alert.
                        </p>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1E293B] text-[#111318] dark:text-[#F1F5F9] group-hover:bg-rose-600 dark:group-hover:bg-[#9B123E] group-hover:text-white transition shadow-2xs">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURES GRID: COMPREHENSIVE DUAL-WORLD CAPABILITIES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 border-t border-[#E8D7DC] dark:border-[#1E293B] transition-colors scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-[#7E0E32] dark:text-[#FB7185]">
              Comprehensive Protection
            </p>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC] mt-2">
              Built for Real Life, Ground & Cloud.
            </h2>
            <p className="mt-3 text-base text-[#374151] dark:text-[#94A3B8] font-medium leading-relaxed">
              Every tool in SaheliShield is designed to remove hesitation, verify facts, and give you immediate peace of mind.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] transition hover:shadow-xl dark:hover:border-[#7E0E32]/60">
              <div className="h-12 w-12 rounded-2xl bg-[#7E0E32]/10 dark:bg-rose-500/20 text-[#7E0E32] dark:text-[#FB7185] flex items-center justify-center mb-4">
                <Navigation size={23} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                Intelligent Safe Corridors
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] leading-relaxed font-medium">
                Avoid poorly illuminated and abandoned streets with route analysis that prioritizes verified high-safety paths and CCTV presence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] transition hover:shadow-xl dark:hover:border-[#7E0E32]/60">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert size={23} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                AI Phishing & Scam Radar
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] leading-relaxed font-medium">
                Paste suspicious links, WhatsApp job offers, or lottery messages to obtain a transparent breakdown of threats before taking action.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] transition hover:shadow-xl dark:hover:border-[#7E0E32]/60">
              <div className="h-12 w-12 rounded-2xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Users size={23} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                Verified Community Sentinel
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] leading-relaxed font-medium">
                Benefit from crowdsourced hazard warnings that undergo validation to maintain trustworthy and spam-free safety intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COMMUNITY SENTINEL SECTION */}
      {/* ========================================================================= */}
      <section id="community" className="py-20 bg-[#FFF7F8] dark:bg-[#0E121A] border-t border-[#E8D7DC] dark:border-[#1E293B] transition-colors scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7E0E32]/10 dark:bg-rose-500/20 px-3.5 py-1 text-xs font-bold text-[#7E0E32] dark:text-[#FB7185] mb-3">
              <Users size={14} />
              <span>Community-Powered Intelligence</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC]">
              Strength in Numbers. <br />
              <span className="text-[#840D34] dark:text-[#FB7185]">Safety in Community.</span>
            </h2>
            <p className="mt-3 text-base text-[#374151] dark:text-[#94A3B8] font-medium leading-relaxed">
              Real-world safety is built together. SaheliShield harnesses verified crowd reports, trusted peer networks, and local insights to protect everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Community Pillar 1 */}
            <div className="rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-7 shadow-xs hover:shadow-md transition">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4 border border-teal-200 dark:border-teal-800/60">
                <Navigation size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                Verified Hazard Reports
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] font-medium leading-relaxed">
                Crowd-sourced reports on streetlight outages, unmonitored roads, or temporary obstacles undergo algorithmic validation before influencing route scoring.
              </p>
            </div>

            {/* Community Pillar 2 */}
            <div className="rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-7 shadow-xs hover:shadow-md transition">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/60">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                Peer Verification Network
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] font-medium leading-relaxed">
                Members report newly emerging scam phone numbers, fake job links, and malicious QR codes, instantly alerting all users across the network.
              </p>
            </div>

            {/* Community Pillar 3 */}
            <div className="rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-7 shadow-xs hover:shadow-md transition">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-800/60">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-[#111318] dark:text-[#F8FAFC]">
                Trusted Circles & Check-ins
              </h3>
              <p className="mt-2 text-sm text-[#4B5563] dark:text-[#94A3B8] font-medium leading-relaxed">
                Designate trusted emergency contacts who receive automatic milestone updates and one-tap SOS alerts whenever you are in transit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. IMPACT SECTION (SLEEK HORIZONTAL PROTOTYPE BAR) */}
      {/* ========================================================================= */}
      <section id="impact" className="py-5 sm:py-6 bg-white dark:bg-[#0E121A] border-y border-[#E8D7DC] dark:border-[#1E293B] transition-colors scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
            {/* Prototype Indicator */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Prototype v3.0
              </span>
              <span className="text-xs font-bold text-[#4B5563] dark:text-[#94A3B8]">
                Interactive Pilot Scope
              </span>
            </div>

            {/* Clean Prototype Metrics — Zero Scrollbar */}
            <div className="flex items-center gap-4 sm:gap-7 lg:gap-9">
              <div className="text-left">
                <p className="font-serif-editorial text-2xl font-extrabold text-[#7E0E32] dark:text-[#FB7185] leading-none">
                  20+
                </p>
                <p className="text-[11px] font-bold text-[#374151] dark:text-[#94A3B8] mt-1 whitespace-nowrap">
                  Cities in Pilot
                </p>
              </div>

              <div className="h-7 w-px bg-[#DEC4CB] dark:bg-[#253146]" />

              <div className="text-left">
                <p className="font-serif-editorial text-2xl font-extrabold text-[#0D9488] dark:text-[#2DD4BF] leading-none">
                  95%+
                </p>
                <p className="text-[11px] font-bold text-[#374151] dark:text-[#94A3B8] mt-1 whitespace-nowrap">
                  Corridor Safety Score
                </p>
              </div>

              <div className="h-7 w-px bg-[#DEC4CB] dark:bg-[#253146]" />

              <div className="text-left">
                <p className="font-serif-editorial text-2xl font-extrabold text-[#111318] dark:text-[#F1F5F9] leading-none">
                  2-in-1
                </p>
                <p className="text-[11px] font-bold text-[#374151] dark:text-[#94A3B8] mt-1 whitespace-nowrap">
                  Travel & Scam Shield
                </p>
              </div>

              <div className="h-7 w-px bg-[#DEC4CB] dark:bg-[#253146] hidden sm:block" />

              <div className="text-left hidden sm:block">
                <p className="font-serif-editorial text-2xl font-extrabold text-[#111318] dark:text-[#F1F5F9] leading-none">
                  100%
                </p>
                <p className="text-[11px] font-bold text-[#374151] dark:text-[#94A3B8] mt-1 whitespace-nowrap">
                  Free & Open
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 border-t border-[#E8D7DC] dark:border-[#1E293B] transition-colors scroll-mt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-[#7E0E32] dark:text-[#FB7185]">
              Got Questions?
            </p>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] transition-all duration-300 shadow-2xs hover:border-[#7E0E32]/40 dark:hover:border-[#FB7185]/40"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-extrabold text-[#111318] dark:text-[#F8FAFC] focus:outline-none cursor-pointer select-none transition-colors duration-200"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="pr-4">{item.q}</span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "bg-[#7E0E32] text-white dark:bg-[#FB7185] dark:text-[#0B0E14] shadow-xs"
                          : "bg-slate-100 dark:bg-[#0B0E14] text-[#7E0E32] dark:text-[#FB7185]"
                      }`}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 text-sm text-[#374151] dark:text-[#94A3B8] leading-relaxed border-t border-slate-100 dark:border-[#253146] pt-3 font-medium">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#E8D7DC] dark:border-[#1E293B] py-12 text-xs bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#4B5563] dark:text-[#94A3B8] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="SaheliShield Official Shield Logo"
                className="h-9 w-9 object-contain rounded-xl shadow-xs"
              />
              <span className="font-serif-editorial text-xl font-bold text-[#7E0E32] dark:text-[#FB7185]">
                Saheli<span className="text-[#111318] dark:text-[#F1F5F9]">Shield</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-[#374151] dark:text-[#CBD5E1]">
              <a href="#about" className="hover:text-[#7E0E32] dark:hover:text-[#FB7185]">About</a>
              <a href="#features" className="hover:text-[#7E0E32] dark:hover:text-[#FB7185]">Features</a>
              <a href="#community" className="hover:text-[#7E0E32] dark:hover:text-[#FB7185]">Community Sentinel</a>
              <a href="#faq" className="hover:text-[#7E0E32] dark:hover:text-[#FB7185]">FAQ</a>
              <a href="#" className="hover:text-[#7E0E32] dark:hover:text-[#FB7185]">Privacy Disclosures</a>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-[#64748B] font-semibold">
              © 2026 SaheliShield. Built for safety & empowerment.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#DEC4CB] dark:border-[#1E293B] text-center text-xs text-[#6B7280] dark:text-[#64748B] leading-normal max-w-2xl mx-auto font-medium">
            SaheliShield provides advisory safety insights, crowd-validated corridor recommendations, and algorithmic risk assessments. In any immediate physical danger, always dial official emergency services (112) first.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 11. INTERACTIVE DEMO WALKTHROUGH MODAL */}
      {/* ========================================================================= */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-[#DEC4CB] dark:border-[#253146] shadow-2xl overflow-hidden bg-white dark:bg-[#161D2B] text-[#111318] dark:text-[#F1F5F9]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5 border-slate-200 dark:border-[#253146]">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="SaheliShield Official Shield Logo"
                  className="h-10 w-10 rounded-xl object-contain shadow-xs shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base text-[#111318] dark:text-[#F8FAFC]">Interactive Product Walkthrough</h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">Experience SaheliShield live simulations</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#253146] bg-slate-50 dark:bg-[#0E121A] p-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoTab("route")}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  demoTab === "route"
                    ? "bg-white dark:bg-[#1E293B] text-[#7E0E32] dark:text-[#FB7185] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <MapPin size={16} />
                SaheliRoute Simulator
              </button>

              <button
                type="button"
                onClick={() => setDemoTab("scam")}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  demoTab === "scam"
                    ? "bg-white dark:bg-[#1E293B] text-rose-700 dark:text-rose-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ShieldAlert size={16} />
                ScamSaathi Scanner
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {demoTab === "route" ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Test the safe corridor planner by setting starting and destination coordinates:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">Start Location</label>
                      <input
                        type="text"
                        value={demoStart}
                        onChange={(e) => setDemoStart(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-[#253146] bg-white dark:bg-[#0B0E14] px-3 py-2 text-xs sm:text-sm font-medium text-[#111318] dark:text-[#F1F5F9] focus:outline-none focus:border-[#7E0E32] dark:focus:border-[#FB7185]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">Destination</label>
                      <input
                        type="text"
                        value={demoDest}
                        onChange={(e) => setDemoDest(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-[#253146] bg-white dark:bg-[#0B0E14] px-3 py-2 text-xs sm:text-sm font-medium text-[#111318] dark:text-[#F1F5F9] focus:outline-none focus:border-[#7E0E32] dark:focus:border-[#FB7185]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDemoRouteCalculated(true)}
                    className="w-full rounded-xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition"
                  >
                    Calculate Verified Safe Corridor
                  </button>

                  {demoRouteCalculated && (
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-950 dark:text-emerald-200 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 size={16} /> Optimal Safe Corridor Identified
                        </span>
                        <span className="text-xs font-extrabold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-full">
                          Safety Score: 94/100
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed font-medium">
                        Routing via <strong>Aurobindo Marg</strong> (92% street light coverage, active commercial zone, 2 police booths en route). Estimated arrival: 16 mins.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Paste any suspicious message, phishing link, or job recruitment text:
                  </p>

                  <textarea
                    rows={3}
                    value={demoScamText}
                    onChange={(e) => setDemoScamText(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#253146] bg-white dark:bg-[#0B0E14] p-3 text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-mono font-medium text-[#111318] dark:text-[#F1F5F9]"
                  />

                  <button
                    type="button"
                    onClick={() => setDemoScamAnalyzed(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-[#7E0E32] py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-95 transition"
                  >
                    Run AI Scam Defense Scan
                  </button>

                  {demoScamAnalyzed && (
                    <div className="rounded-2xl border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-950 dark:text-rose-200 animate-in fade-in space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                          <AlertTriangle size={16} /> HIGH PHISHING RISK DETECTED
                        </span>
                        <span className="text-[10px] font-extrabold bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-full">
                          Confidence: 98%
                        </span>
                      </div>
                      <ul className="text-xs list-disc pl-5 space-y-1 font-medium">
                        <li>Domain &apos;sbi-kyc-verify-portal.top&apos; is not an official banking URL.</li>
                        <li>Urgent threat language used (&quot;blocked today&quot;) to induce panic.</li>
                        <li>Legitimate banks never ask for PAN verification via third-party SMS links.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 dark:border-[#253146] bg-slate-50 dark:bg-[#0E121A] p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Full tools available upon registration.</span>
              <button
                type="button"
                onClick={() => {
                  setDemoModalOpen(false);
                  onGetStarted();
                }}
                className="rounded-full bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-5 py-2 text-xs font-bold text-white transition"
              >
                Register Free Account →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

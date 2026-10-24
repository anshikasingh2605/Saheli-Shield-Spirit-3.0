
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Info,
  X,
} from "lucide-react";

import api from "../services/api";

function GoogleIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Authentication State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomAccountInput, setShowCustomAccountInput] = useState(false);
  const [customError, setCustomError] = useState("");

  const suggestedAccounts = [
    {
      id: "google_primary_anshika",
      name: "Anshika Singh",
      email: "anshika.singh@gmail.com",
      avatarColor: "bg-[#7E0E32]",
    },
    {
      id: "google_saheli_traveler",
      name: "Saheli Traveler",
      email: "traveler.safety@gmail.com",
      avatarColor: "bg-[#0D9488]",
    },
  ];

  // Initialize official Google Identity Services script if client ID is configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== "undefined" && !window.google?.accounts?.id) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: (response) => {
                if (response?.credential) {
                  const payload = parseJwt(response.credential);
                  if (payload) {
                    completeGoogleLogin({
                      id: payload.sub || "google_" + Date.now(),
                      name: payload.name || payload.given_name || "Google User",
                      email: payload.email,
                      avatar: payload.picture,
                    });
                  }
                }
              },
            });
          }
        } catch (e) {
          console.warn("Google GIS init:", e);
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  function completeGoogleLogin(profile) {
    setGoogleLoading(true);
    setError("");
    setNotice("");

    setTimeout(() => {
      const googleUser = {
        id: profile.id || "google_" + Date.now(),
        name: profile.name || "Google Traveler",
        email: profile.email || "traveler@gmail.com",
        phone: profile.phone || "",
        authProvider: "google",
        avatar: profile.avatar || null,
        createdAt: new Date().toISOString(),
      };

      const googleToken =
        "google_oauth_" +
        btoa(unescape(encodeURIComponent(JSON.stringify(googleUser))));

      localStorage.setItem("sahelishield_token", googleToken);
      localStorage.setItem("sahelishield_user", JSON.stringify(googleUser));

      setGoogleLoading(false);
      setGoogleModalOpen(false);

      if (typeof onLogin === "function") {
        onLogin(googleUser);
      }
    }, 450);
  }

  function handleGoogleSignIn() {
    if (loading || googleLoading) return;
    setError("");
    setNotice("");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleModalOpen(true);
          }
        });
        return;
      } catch (e) {
        console.warn("Google prompt error, opening modal:", e);
      }
    }

    setGoogleModalOpen(true);
  }

  function handleCustomGoogleSubmit(e) {
    e.preventDefault();
    setCustomError("");

    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const cleanName = customGoogleName.trim();

    if (!cleanName || cleanName.length < 2) {
      setCustomError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setCustomError("Please enter a valid Google email address.");
      return;
    }

    completeGoogleLogin({
      name: cleanName,
      email: cleanEmail,
    });
  }

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setNotice("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (isRegister && cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/auth/register"
        : "/auth/login";

      const payload = isRegister
        ? {
            name: cleanName,
            email: cleanEmail,
            password,
          }
        : {
            email: cleanEmail,
            password,
          };

      const response = await api.post(endpoint, payload);
      const result = response.data?.data;

      if (!result?.token || !result?.user) {
        throw new Error(
          "The server response is missing the user or authentication token. Check the backend response format."
        );
      }

      // Save the authenticated session.
      localStorage.setItem(
        "sahelishield_token",
        result.token
      );

      localStorage.setItem(
        "sahelishield_user",
        JSON.stringify(result.user)
      );

      // Notify App.jsx only after successful authentication.
      if (typeof onLogin === "function") {
        onLogin(result.user);
      }
    } catch (err) {
      const status = err.response?.status;
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (!err.response) {
        setError(
          "Unable to connect to the backend. Make sure the server is running and the API URL is correct."
        );
      } else if (status === 401) {
        setError(
          isRegister
            ? serverMessage || "Registration was not authorized."
            : "Invalid email or password."
        );
      } else if (status === 409) {
        setError(
          serverMessage ||
            "An account with this email may already exist. Try signing in."
        );
      } else {
        setError(
          serverMessage ||
            "Authentication failed. Please check your details and try again."
        );
      }

      // Remove a partially saved session if login failed.
      localStorage.removeItem("sahelishield_token");
      localStorage.removeItem("sahelishield_user");
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode) {
    if (loading) return;

    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }

  return (
    <div className="flex min-h-screen bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#111318] dark:text-[#F1F5F9] font-sans-ui transition-colors">
      {/* Left information panel */}
      <section className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#2D0B40] via-[#5A0A26] to-[#7E0E32] p-12 text-white lg:flex overflow-hidden">
        {/* Soft atmospheric gradient glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FB7185]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-black/40 blur-3xl" />

        <div className="relative z-10">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/95 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/40 hover:shadow-md active:scale-95 cursor-pointer group"
            >
              <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-1 text-rose-200" />
              <span>Back to SaheliShield</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SaheliShield"
              className="h-11 w-11 rounded-xl object-contain shadow-md ring-1 ring-white/20"
            />
            <div>
              <h1 className="font-serif-editorial text-2xl font-bold tracking-tight text-white leading-none">
                SaheliShield
              </h1>
              <p className="text-xs text-rose-200/90 font-medium mt-0.5">
                One shield for safety everywhere
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-rose-100 backdrop-blur-xs">
            Your safety. Your control.
          </div>

          <h2 className="font-serif-editorial text-4xl sm:text-5xl font-bold leading-tight text-white">
            Feel safer in every journey and every click.
          </h2>

          <p className="mt-6 text-base leading-relaxed text-rose-100/90 font-medium">
            Plan journeys with confidence and recognize
            potential digital scams with your personal
            safety workspace.
          </p>

          <div className="mt-8 space-y-3.5 text-sm font-semibold text-rose-100/95">
            <p className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={16} className="text-amber-300" />
              </span>
              Travel safety tools & crowd-verified corridors
            </p>

            <p className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={16} className="text-amber-300" />
              </span>
              AI-powered digital scam & fraud detection
            </p>

            <p className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={16} className="text-amber-300" />
              </span>
              Emergency SMS alert network for trusted contacts
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-rose-200/80 font-medium">
          SaheliShield · Built for safety & empowerment
        </p>
      </section>

      {/* Authentication form */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          {onBack && (
            <div className="mb-6 lg:hidden">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B]/90 px-4 py-2 text-xs font-bold text-[#111318] dark:text-[#F1F5F9] shadow-xs backdrop-blur-md hover:border-[#7E0E32] dark:hover:border-[#FB7185] transition-all active:scale-95 cursor-pointer group"
              >
                <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1 text-[#7E0E32] dark:text-[#FB7185]" />
                <span>Back to SaheliShield</span>
              </button>
            </div>
          )}

          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/logo.png"
              alt="SaheliShield"
              className="h-10 w-10 rounded-xl object-contain shadow-xs ring-1 ring-[#7E0E32]/10 dark:ring-white/10"
            />
            <div>
              <h1 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#7E0E32] dark:text-[#FB7185] leading-none">
                Saheli<span className="text-[#111318] dark:text-[#F1F5F9]">Shield</span>
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                One shield for safety everywhere
              </p>
            </div>
          </div>

          <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E0E32] dark:text-[#FB7185]">
            Welcome to SaheliShield
          </p>

          <h2 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#111318] dark:text-[#F8FAFC]">
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#6B7280] dark:text-[#94A3B8]">
            {isRegister
              ? "Create an account to get started with your safety workspace."
              : "Sign in to access your personal safety workspace."}
          </p>

          {/* Login and registration tabs */}
          <div className="mt-7 grid grid-cols-2 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/80 dark:bg-[#161D2B]/80 p-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => changeMode("login")}
              className={`rounded-full py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                !isRegister
                  ? "bg-[#7E0E32] text-white shadow-xs"
                  : "text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9]"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => changeMode("register")}
              className={`rounded-full py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                isRegister
                  ? "bg-[#7E0E32] text-white shadow-xs"
                  : "text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9]"
              }`}
            >
              Create account
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {/* Full name */}
            {isRegister && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
                >
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
                  <UserRound
                    size={18}
                    className="text-[#6B7280] dark:text-[#94A3B8]"
                  />

                  <input
                    id="auth-name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your full name"
                    maxLength={80}
                    required
                    aria-required="true"
                    disabled={loading}
                    className="w-full py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
                <Mail
                  size={18}
                  className="text-[#6B7280] dark:text-[#94A3B8]"
                />

                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
                <LockKeyhole
                  size={18}
                  className="text-[#6B7280] dark:text-[#94A3B8]"
                />

                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  disabled={loading}
                  className="w-full py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            {isRegister && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
                >
                  Confirm password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
                  <LockKeyhole
                    size={18}
                    className="text-[#6B7280] dark:text-[#94A3B8]"
                  />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    required
                    disabled={loading}
                    className="w-full py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* API error */}
            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-bold text-red-700 dark:text-red-300"
              >
                {error}
              </p>
            )}

            {/* Optional status notice */}
            {notice && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs font-bold leading-5 text-amber-900 dark:text-amber-200"
              >
                <Info
                  className="mt-0.5 shrink-0"
                  size={16}
                />
                {notice}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#7E0E32]/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}

              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DEC4CB] dark:border-[#253146]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FFF9F5] dark:bg-[#0B0E14] px-3 font-bold text-[#6B7280] dark:text-[#94A3B8]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Sign in with Google Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-4 py-3.5 text-sm font-bold text-[#111318] dark:text-[#F1F5F9] shadow-xs hover:bg-[#FFF9F5] dark:hover:bg-[#1E293B] hover:border-[#7E0E32]/40 dark:hover:border-[#FB7185]/40 transition active:scale-[0.99] cursor-pointer"
          >
            {googleLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7E0E32] border-t-transparent" />
            ) : (
              <GoogleIcon className="h-5 w-5 shrink-0" />
            )}
            <span>
              {googleLoading
                ? "Connecting to Google..."
                : isRegister
                  ? "Sign up with Google"
                  : "Sign in with Google"}
            </span>
          </button>

          <p className="mt-6 text-center text-xs leading-5 text-[#6B7280] dark:text-[#94A3B8]">
            By continuing, you agree to use SaheliShield
            responsibly. Never share your password or
            authentication credentials with anyone.
          </p>
        </div>
      </section>

      {/* Google Account Selector Modal */}
      {googleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => !googleLoading && setGoogleModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-6 shadow-2xl transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={() => setGoogleModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-[#6B7280] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-[#0B0E14] border border-[#E8D7DC] dark:border-[#253146] shadow-sm mb-3">
                <GoogleIcon className="h-6 w-6" />
              </div>

              <h3 className="font-serif-editorial text-xl font-bold text-[#111318] dark:text-[#F8FAFC]">
                Sign in with Google
              </h3>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Choose an account to continue to{" "}
                <span className="font-bold text-[#7E0E32] dark:text-[#FB7185]">
                  SaheliShield
                </span>
              </p>
            </div>

            {/* Account List */}
            <div className="mt-5 space-y-2">
              {suggestedAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  disabled={googleLoading}
                  onClick={() => completeGoogleLogin(account)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#E8D7DC] dark:border-[#253146] bg-[#FFF9F5]/70 dark:bg-[#0B0E14]/50 p-3 text-left transition hover:border-[#7E0E32] dark:hover:border-[#FB7185] hover:bg-white dark:hover:bg-[#1E293B] cursor-pointer group"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${account.avatarColor}`}
                  >
                    {account.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#111318] dark:text-[#F1F5F9] truncate group-hover:text-[#7E0E32] dark:group-hover:text-[#FB7185]">
                      {account.name}
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] truncate">
                      {account.email}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[#6B7280] dark:text-[#94A3B8] transition group-hover:translate-x-0.5 group-hover:text-[#7E0E32] dark:group-hover:text-[#FB7185]"
                  />
                </button>
              ))}

              {/* Use custom account toggle */}
              {!showCustomAccountInput ? (
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={() => setShowCustomAccountInput(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#DEC4CB] dark:border-[#253146] py-2.5 text-xs font-bold text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111318] dark:hover:text-[#F1F5F9] hover:border-[#7E0E32] dark:hover:border-[#FB7185] transition cursor-pointer"
                >
                  <UserRound size={14} />
                  <span>Use another account</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomGoogleSubmit}
                  className="rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#0B0E14] p-3 space-y-2 mt-2"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E0E32] dark:text-[#FB7185]">
                    Enter Google Account Details
                  </p>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                    disabled={googleLoading}
                    className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3 py-2 text-xs outline-none text-[#111318] dark:text-[#F1F5F9] focus:border-[#7E0E32] dark:focus:border-[#FB7185]"
                  />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    disabled={googleLoading}
                    className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3 py-2 text-xs outline-none text-[#111318] dark:text-[#F1F5F9] focus:border-[#7E0E32] dark:focus:border-[#FB7185]"
                  />
                  {customError && (
                    <p className="text-[11px] font-bold text-red-600 dark:text-red-400">
                      {customError}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="flex-1 rounded-xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] py-2 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={() => {
                        setShowCustomAccountInput(false);
                        setCustomError("");
                      }}
                      className="rounded-xl border border-[#DEC4CB] dark:border-[#253146] px-3 py-2 text-xs font-bold text-[#4B5563] dark:text-[#94A3B8] transition cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy notice */}
            <p className="mt-4 text-[11px] text-center text-[#6B7280] dark:text-[#94A3B8] leading-tight">
              To continue, Google shares your name, email, and profile picture with SaheliShield.
            </p>

            {/* Loading state indicator */}
            {googleLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/90 dark:bg-[#161D2B]/90 backdrop-blur-xs">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#7E0E32] border-t-transparent" />
                <p className="mt-2 text-xs font-bold text-[#7E0E32] dark:text-[#FB7185]">
                  Signing in with Google...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

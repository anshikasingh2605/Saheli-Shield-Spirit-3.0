
import { useState, useEffect, useRef } from "react";
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
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Real Google OAuth Configuration
  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "587929881725-fv3g2rgp5mrih0bnvl8klg6shigjg4ub.apps.googleusercontent.com";

  const [googleLoading, setGoogleLoading] = useState(false);
  const tokenClientRef = useRef(null);

  function completeGoogleLogin(profile) {
    setGoogleLoading(true);
    setError("");
    setNotice("");

    try {
      const googleUser = {
        id: profile.id || "google_" + Date.now(),
        name: profile.name || "Google User",
        email: profile.email,
        phone: profile.phone || "",
        authProvider: "google",
        avatar: profile.avatar || null,
        createdAt: new Date().toISOString(),
      };

      const googleToken =
        "google_oauth_" +
        (profile.token || btoa(unescape(encodeURIComponent(JSON.stringify(googleUser)))));

      localStorage.setItem("sahelishield_token", googleToken);
      localStorage.setItem("sahelishield_user", JSON.stringify(googleUser));

      setGoogleLoading(false);

      if (typeof onLogin === "function") {
        onLogin(googleUser);
      }
    } catch (err) {
      console.error("Google session error:", err);
      setError("Failed to process Google profile. Please try again.");
      setGoogleLoading(false);
    }
  }

  function handleCredentialResponse(response) {
    if (response?.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        completeGoogleLogin({
          id: payload.sub,
          name: payload.name || payload.given_name || "Google User",
          email: payload.email,
          avatar: payload.picture,
          token: response.credential,
        });
      } else {
        setError("Invalid Google token payload received.");
        setGoogleLoading(false);
      }
    } else {
      setError("No credential returned by Google Sign-In.");
      setGoogleLoading(false);
    }
  }

  // Load and initialize official Google Identity Services
  useEffect(() => {
    function initGoogleServices() {
      if (!window.google?.accounts) return;

      try {
        // 1. Initialize Google ID (One Tap / Credential)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // 2. Render official Google button if container is present
        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          container.innerHTML = "";
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "pill",
            text: isRegister ? "signup_with" : "signin_with",
            width: 340,
            logo_alignment: "left",
          });
        }

        // 3. Initialize OAuth 2.0 Token Client for explicit user clicks
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              console.warn("Google token error:", tokenResponse.error);
              if (tokenResponse.error === "popup_closed_by_user") {
                setNotice("Google Sign-In popup was closed.");
              } else {
                setError(`Google Sign-In: ${tokenResponse.error}`);
              }
              setGoogleLoading(false);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                // Fetch real user data directly from Google's UserInfo API
                const res = await fetch(
                  "https://www.googleapis.com/oauth2/v3/userinfo",
                  {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                  }
                );

                if (!res.ok) {
                  throw new Error("Unable to fetch user info from Google.");
                }

                const profile = await res.json();
                completeGoogleLogin({
                  id: profile.sub,
                  name: profile.name || profile.given_name || "Google User",
                  email: profile.email,
                  avatar: profile.picture,
                  token: tokenResponse.access_token,
                });
              } catch (fetchErr) {
                console.error("UserInfo fetch error:", fetchErr);
                setError("Failed to retrieve Google profile data. Check internet connection.");
                setGoogleLoading(false);
              }
            }
          },
          error_callback: (err) => {
            console.warn("Google OAuth error_callback:", err);
            if (err?.type === "popup_closed") {
              setNotice("Google Sign-In popup was closed.");
            } else {
              setError("Google Sign-In failed. Please verify authorized origins in Google Cloud Console.");
            }
            setGoogleLoading(false);
          },
        });
      } catch (err) {
        console.warn("Google GIS initialization warning:", err);
      }
    }

    if (window.google?.accounts) {
      initGoogleServices();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleServices();
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services script.");
      };
      document.body.appendChild(script);
    }
  }, [mode, isRegister]);

  function handleGoogleSignIn() {
    if (loading || googleLoading) return;
    setError("");
    setNotice("");
    setGoogleLoading(true);

    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        console.error("Token client error:", err);
        setError("Failed to open Google account chooser. Please check popup blockers.");
        setGoogleLoading(false);
      }
    } else if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setError("Google popup was blocked or skipped. Please click the official Google button above.");
            setGoogleLoading(false);
          }
        });
      } catch (err) {
        console.error("Google prompt error:", err);
        setError("Google initialization error: " + err.message);
        setGoogleLoading(false);
      }
    } else {
      setError("Google Identity Services is loading. Please check your connection and try again.");
      setGoogleLoading(false);
    }
  }

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

          {/* Official Google Identity Services Container & Custom Trigger */}
          <div className="flex flex-col items-center gap-3">
            <div
              id="google-signin-btn-container"
              className="flex justify-center w-full min-h-[44px]"
            />

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
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#6B7280] dark:text-[#94A3B8]">
            By continuing, you agree to use SaheliShield
            responsibly. Never share your password or
            authentication credentials with anyone.
          </p>
        </div>
      </section>
    </div>
  );
}
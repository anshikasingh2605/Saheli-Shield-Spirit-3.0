
import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
} from "lucide-react";

import api from "../services/api";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen bg-white">
      {/* Left information panel */}
      <section className="hidden w-1/2 flex-col justify-between bg-violet-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold">
              SaheliShield
            </h1>
            <p className="text-sm text-violet-200">
              One shield for safety everywhere
            </p>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            Your safety. Your control.
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Feel safer in every journey and every click.
          </h2>

          <p className="mt-6 text-lg leading-8 text-violet-100">
            Plan journeys with confidence and recognize
            potential digital scams with your personal
            safety workspace.
          </p>

          <div className="mt-8 space-y-4 text-sm text-violet-100">
            <p className="flex items-center gap-3">
              <ShieldCheck size={19} />
              Travel safety tools
            </p>

            <p className="flex items-center gap-3">
              <ShieldCheck size={19} />
              Scam awareness and prevention
            </p>

            <p className="flex items-center gap-3">
              <ShieldCheck size={19} />
              A connected safety experience
            </p>
          </div>
        </div>

        <p className="text-sm text-violet-200">
          SaheliShield · Safety for everyday life
        </p>
      </section>

      {/* Authentication form */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-violet-700 p-3 text-white">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                SaheliShield
              </h1>
              <p className="text-xs text-slate-500">
                One shield for safety everywhere
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-violet-700">
            Welcome to SaheliShield
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {isRegister
              ? "Create an account to get started with your safety workspace."
              : "Sign in to access your personal safety workspace."}
          </p>

          {/* Login and registration tabs */}
          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => changeMode("login")}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                !isRegister
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => changeMode("register")}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                isRegister
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500"
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
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                  <UserRound
                    size={18}
                    className="text-slate-400"
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
                    disabled={loading}
                    className="w-full py-3 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                <Mail
                  size={18}
                  className="text-slate-400"
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
                  className="w-full py-3 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                <LockKeyhole
                  size={18}
                  className="text-slate-400"
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
                  className="w-full py-3 outline-none"
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
                  className="text-slate-400 hover:text-slate-700"
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
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            )}

            {/* API error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-700"
              >
                {error}
              </p>
            )}

            {/* Optional status notice */}
            {notice && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900"
              >
                <Info
                  className="mt-1 shrink-0"
                  size={17}
                />
                {notice}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to use SaheliShield
            responsibly. Never share your password or
            authentication credentials with anyone.
          </p>
        </div>
      </section>
    </div>
  );
}

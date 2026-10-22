
import { useState } from "react";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  LoaderCircle,
  MessageSquareText,
  BriefcaseBusiness,
  CreditCard,
} from "lucide-react";

import api from "../services/api";

const examples = [
  {
    label: "Suspicious message",
    icon: MessageSquareText,
    text: "URGENT! Your bank account will be blocked today. Share your OTP immediately to reactivate it.",
  },
  {
    label: "Job offer",
    icon: BriefcaseBusiness,
    text: "Congratulations! You are selected for a work-from-home job. Pay a registration fee today to confirm your position.",
  },
  {
    label: "Payment request",
    icon: CreditCard,
    text: "Your prize is ready. Pay a processing fee now and send your banking PIN to receive the money.",
  },
];

const riskLabels = {
  safe: "No major warning signs detected",
  low_risk: "Low risk",
  potentially_suspicious: "Potentially suspicious",
  high_risk: "High risk",
};

function getRiskStyle(riskLevel) {
  switch (riskLevel) {
    case "high_risk":
      return {
        icon: AlertTriangle,
        color: "text-red-600",
        background: "bg-red-50",
        border: "border-red-200",
      };

    case "potentially_suspicious":
      return {
        icon: Info,
        color: "text-amber-600",
        background: "bg-amber-50",
        border: "border-amber-200",
      };

    case "low_risk":
      return {
        icon: Info,
        color: "text-yellow-700",
        background: "bg-yellow-50",
        border: "border-yellow-200",
      };

    default:
      return {
        icon: CheckCircle2,
        color: "text-emerald-600",
        background: "bg-emerald-50",
        border: "border-emerald-200",
      };
  }
}

export default function ScamSaathi() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event) {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed) {
      setError("Please enter a message, link, or offer to analyze.");
      return;
    }

    if (trimmed.length > 5000) {
      setError("Content cannot exceed 5,000 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post("/scams/analyze", {
        message: trimmed,
        saveHistory: true,
      });

      const analysis = response.data?.data;

      if (
        !analysis ||
        !analysis.riskLevel ||
        !Array.isArray(analysis.indicators)
      ) {
        throw new Error(
          "The backend returned an unexpected analysis response."
        );
      }

      setResult(analysis);
    } catch (err) {
      const status = err.response?.status;

      if (!err.response) {
        setError(
          "Unable to reach the backend. Check that the server is running and try again."
        );
      } else if (status === 429) {
        setError(
          "Too many analysis requests. Please wait a little before trying again."
        );
      } else {
        const serverMessage =
          err.response?.data?.message ||
          err.response?.data?.errors?.join?.(" ");

        setError(
          serverMessage ||
            "Scam analysis failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    if (loading) return;

    setMessage("");
    setResult(null);
    setError("");
  }

  const risk = result
    ? getRiskStyle(result.riskLevel)
    : null;

  const RiskIcon = risk?.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck size={27} />
          </div>

          <div>
            <p className="text-sm font-medium text-emerald-700">
              DIGITAL SAFETY ASSISTANT
            </p>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Think before you trust.
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Paste a suspicious message, job offer, payment request,
          or URL to check for common scam warning signs.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <MessageSquareText
            className="text-emerald-700"
            size={21}
          />

          <h3 className="font-semibold text-slate-900">
            Analyze suspicious content
          </h3>
        </div>

        <form onSubmit={handleAnalyze}>
          <label
            htmlFor="scam-message"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Message, link, or offer
          </label>

          <textarea
            id="scam-message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setResult(null);
              setError("");
            }}
            maxLength={5000}
            rows={7}
            required
            disabled={loading}
            placeholder="Paste the suspicious message here..."
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"
          />

          <div className="mt-2 flex justify-between gap-3 text-xs text-slate-400">
            <span>Do not include real passwords or OTPs.</span>
            <span>{message.length}/5000</span>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Try a sample
            </p>

            <div className="flex flex-wrap gap-2">
              {examples.map((example) => {
                const Icon = example.icon;

                return (
                  <button
                    type="button"
                    key={example.label}
                    disabled={loading}
                    onClick={() => {
                      setMessage(example.text);
                      setResult(null);
                      setError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <Icon size={15} />
                    {example.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Search size={17} />
              )}

              {loading ? "Analyzing..." : "Analyze content"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </form>
      </section>

      {result && risk && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex items-start gap-3">
            <RiskIcon
              className={`mt-1 ${risk.color}`}
              size={25}
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Backend analysis result
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {riskLabels[result.riskLevel] ||
                  result.riskLevel.replaceAll("_", " ")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {result.explanation ||
                  "The analysis has completed. Review the warning signs and recommended actions below."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${risk.background} ${risk.color} ${risk.border}`}
                >
                  {result.riskLevel.replaceAll("_", " ")}
                </span>

                {result.analysisSource && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    Source: {result.analysisSource.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="font-semibold text-slate-900">
              Warning signs found
            </h4>

            {result.indicators.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {result.indicators.map((indicator, index) => (
                  <li
                    key={`${indicator}-${index}`}
                    className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                  >
                    <AlertTriangle
                      className="mt-1 shrink-0 text-amber-600"
                      size={16}
                    />
                    {indicator}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No warning indicators were returned by the analysis.
                This does not guarantee that the content is safe.
              </p>
            )}
          </div>

          {Array.isArray(result.detectedCategories) &&
            result.detectedCategories.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="font-semibold text-slate-900">
                  Detected categories
                </h4>

                <div className="mt-3 flex flex-wrap gap-2">
                  {result.detectedCategories.map((category, index) => (
                    <span
                      key={`${category}-${index}`}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {Array.isArray(result.recommendedActions) &&
            result.recommendedActions.length > 0 && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                <h4 className="font-semibold text-emerald-900">
                  Recommended actions
                </h4>

                <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-emerald-900">
                  {result.recommendedActions.map((action, index) => (
                    <li key={`${action}-${index}`}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

          {result.disclaimer && (
            <p className="mt-5 text-xs leading-5 text-slate-500">
              {result.disclaimer}
            </p>
          )}
        </section>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info
          className="mt-0.5 shrink-0 text-amber-700"
          size={19}
        />

        <p className="text-sm leading-6 text-amber-900">
          Scam analysis is a risk assessment, not proof of fraud.
          Even content with a low risk score may be malicious.
          Never share OTPs, passwords, or banking PINs, and verify
          offers through official channels.
        </p>
      </div>
    </div>
  );
}

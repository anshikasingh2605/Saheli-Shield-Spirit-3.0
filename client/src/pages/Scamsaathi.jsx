
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
    <div className="mx-auto max-w-4xl space-y-6 font-sans-ui">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF] shadow-2xs shrink-0">
            <ShieldCheck size={26} />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF]">
              DIGITAL SAFETY ASSISTANT
            </p>

            <h2 className="font-serif-editorial text-3xl font-bold text-[#111318] dark:text-[#F8FAFC] sm:text-4xl">
              Think before you trust.
            </h2>
          </div>
        </div>

        <p className="mt-3 max-w-2xl leading-relaxed text-sm sm:text-base text-[#4B5563] dark:text-[#94A3B8]">
          Paste a suspicious message, job offer, payment request,
          or URL to check for common scam warning signs.
        </p>
      </section>

      <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-xs sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <MessageSquareText
            className="text-[#0D9488] dark:text-[#2DD4BF]"
            size={20}
          />

          <h3 className="font-serif-editorial text-xl font-bold text-[#111318] dark:text-[#F1F5F9]">
            Analyze suspicious content
          </h3>
        </div>

        <form onSubmit={handleAnalyze}>
          <label
            htmlFor="scam-message"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
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
            className="w-full resize-y rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#0B0E14] text-[#111318] dark:text-[#F1F5F9] p-4 text-sm leading-relaxed outline-none transition placeholder:text-[#6B7280] dark:placeholder:text-[#64748B] focus:border-[#0D9488] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0D9488]/15 disabled:opacity-60"
          />

          <div className="mt-2 flex justify-between gap-3 text-xs text-[#6B7280] dark:text-[#64748B]">
            <span>Do not include real passwords or OTPs.</span>
            <span>{message.length}/5000</span>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]">
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white/90 dark:bg-[#161D2B] px-3.5 py-1.5 text-xs font-bold text-[#4B5563] dark:text-[#CBD5E1] transition hover:border-[#0D9488] hover:text-[#0D9488] dark:hover:text-[#2DD4BF] disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Icon size={14} />
                    {example.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-bold leading-5 text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#0D9488]/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
              className="inline-flex items-center gap-2 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] px-5 py-3 text-sm font-bold text-[#111318] dark:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 transition cursor-pointer"
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
          className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-xs sm:p-7"
        >
          <div className="flex items-start gap-3">
            <RiskIcon
              className={`mt-1 ${risk.color}`}
              size={25}
            />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7280] dark:text-[#64748B]">
                Backend analysis result
              </p>

              <h3 className="font-serif-editorial mt-1 text-2xl font-bold text-[#111318] dark:text-[#F1F5F9]">
                {riskLabels[result.riskLevel] ||
                  result.riskLevel.replaceAll("_", " ")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[#4B5563] dark:text-[#94A3B8]">
                {result.explanation ||
                  "The analysis has completed. Review the warning signs and recommended actions below."}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${risk.background} ${risk.color} ${risk.border}`}
                >
                  {result.riskLevel.replaceAll("_", " ")}
                </span>

                {result.analysisSource && (
                  <span className="rounded-full bg-[#FFF9F5] dark:bg-[#0B0E14] border border-[#DEC4CB] dark:border-[#253146] px-3 py-1 text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">
                    Source: {result.analysisSource.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#E8D7DC] dark:border-[#253146] pt-5">
            <h4 className="font-serif-editorial text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">
              Warning signs found
            </h4>

            {result.indicators.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {result.indicators.map((indicator, index) => (
                  <li
                    key={`${indicator}-${index}`}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]"
                  >
                    <AlertTriangle
                      className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                      size={16}
                    />
                    {indicator}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                No warning indicators were returned by the analysis.
                This does not guarantee that the content is safe.
              </p>
            )}
          </div>

          {Array.isArray(result.detectedCategories) &&
            result.detectedCategories.length > 0 && (
              <div className="mt-5 border-t border-[#E8D7DC] dark:border-[#253146] pt-5">
                <h4 className="font-serif-editorial text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">
                  Detected categories
                </h4>

                <div className="mt-3 flex flex-wrap gap-2">
                  {result.detectedCategories.map((category, index) => (
                    <span
                      key={`${category}-${index}`}
                      className="rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#0B0E14] px-3 py-1 text-xs font-medium text-[#4B5563] dark:text-[#CBD5E1]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {Array.isArray(result.recommendedActions) &&
            result.recommendedActions.length > 0 && (
              <div className="mt-5 rounded-2xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 border border-[#0D9488]/20 p-4">
                <h4 className="font-bold text-sm text-[#0D9488] dark:text-[#2DD4BF]">
                  Recommended actions
                </h4>

                <ul className="mt-2 list-inside list-disc space-y-1 text-xs font-medium leading-relaxed text-[#0F766E] dark:text-[#5EEAD4]">
                  {result.recommendedActions.map((action, index) => (
                    <li key={`${action}-${index}`}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

          {result.disclaimer && (
            <p className="mt-5 text-[11px] leading-4 text-[#6B7280] dark:text-[#64748B]">
              {result.disclaimer}
            </p>
          )}
        </section>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4">
        <Info
          className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
          size={18}
        />

        <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-200">
          Scam analysis is a risk assessment, not proof of fraud.
          Even content with a low risk score may be malicious.
          Never share OTPs, passwords, or banking PINs, and verify
          offers through official channels.
        </p>
      </div>
    </div>
  );
}

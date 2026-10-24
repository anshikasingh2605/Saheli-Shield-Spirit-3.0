
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History,
  MapPin,
  ShieldCheck,
  Search,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Siren,
} from "lucide-react";
import api from "../services/api";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Unable to load records."
  );
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return null;
}

function getRiskLabel(value) {
  const labels = {
    safe: "Safe",
    low_risk: "Low risk",
    potentially_suspicious: "Suspicious",
    high_risk: "High risk",
  };

  return labels[value] || value || "Analyzed";
}

function getStatusStyle(status, type) {
  if (type === "scam") {
    switch (status) {
      case "High risk":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50";
      case "Suspicious":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
      case "Low risk":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50";
      case "Safe":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
      default:
        return "bg-[#FFF9F5] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] border border-[#DEC4CB] dark:border-[#253146]";
    }
  }

  switch (String(status).toLowerCase()) {
    case "active":
      return "bg-[#0D9488]/10 text-[#0D9488] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] border border-[#0D9488]/20";
    case "completed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
    case "cancelled":
      return "bg-[#FFF9F5] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] border border-[#DEC4CB] dark:border-[#253146]";
    case "overdue":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50";
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
  }
}

function formatJourneyStatus(status) {
  const labels = {
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    overdue: "Overdue",
  };

  return labels[String(status).toLowerCase()] || status || "Recorded";
}

export default function ActivityHistory() {
  const [filter, setFilter] = useState("all");
  const [scans, setScans] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partialErrors, setPartialErrors] = useState([]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    setPartialErrors([]);

    const [scamResult, journeyResult] = await Promise.allSettled([
      api.get("/scams/history"),
      api.get("/journeys/history"),
    ]);

    const errors = [];

    if (scamResult.status === "fulfilled") {
      const response = scamResult.value.data;
      const history = extractArray(response?.data, [
        "scans",
        "history",
        "records",
      ]);

      if (history !== null) {
        setScans(history);
      } else {
        setScans([]);
        errors.push("Scam history returned an unexpected response format.");
      }
    } else {
      setScans([]);
      errors.push(`Scam history: ${getErrorMessage(scamResult.reason)}`);
    }

    if (journeyResult.status === "fulfilled") {
      const response = journeyResult.value.data;
      const history = extractArray(response?.data, [
        "journeys",
        "history",
        "records",
      ]);

      if (history !== null) {
        setJourneys(history);
      } else {
        setJourneys([]);
        errors.push("Journey history returned an unexpected response format.");
      }
    } else {
      setJourneys([]);
      errors.push(`Journey history: ${getErrorMessage(journeyResult.reason)}`);
    }

    setPartialErrors(errors);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const activities = useMemo(() => {
    const scamActivities = scans.map((scan, index) => {
      const riskLevel = scan.riskLevel || scan.result?.riskLevel;
      const timestamp =
        scan.createdAt ||
        scan.updatedAt ||
        scan.timestamp ||
        scan.scannedAt;

      return {
        id: `scam-${scan._id || scan.id || scan.scanId || index}`,
        type: "scam",
        title: "Scam message analysis",
        detail:
          scan.submittedSnippet ||
          scan.message ||
          scan.url ||
          scan.content ||
          scan.explanation ||
          "Scam analysis completed.",
        status: getRiskLabel(riskLevel),
        riskLevel,
        time: formatDate(timestamp),
        sortTime: timestamp ? new Date(timestamp).getTime() : 0,
        explanation: scan.explanation || scan.result?.explanation,
      };
    });

    const journeyActivities = journeys.map((journey, index) => {
      const status = String(journey.status || "").toLowerCase();
      const timestamp =
        journey.createdAt ||
        journey.startedAt ||
        journey.updatedAt;

      return {
        id: `journey-${journey._id || journey.id || index}`,
        type: "journey",
        title:
          status === "completed"
            ? "Journey completed"
            : status === "active"
              ? "Journey started"
              : status === "cancelled"
                ? "Journey cancelled"
                : status === "overdue"
                  ? "Journey overdue"
                  : "Journey activity",
        detail: `${journey.origin?.label || "Starting point"} → ${
          journey.destination?.label || "Destination"
        }`,
        status: formatJourneyStatus(status),
        time: formatDate(timestamp),
        sortTime: timestamp ? new Date(timestamp).getTime() : 0,
        explanation: journey.completedAt
          ? `Completed on ${formatDate(journey.completedAt)}`
          : journey.sosTriggered
            ? `SOS was triggered${journey.sosTriggeredAt ? ` on ${formatDate(journey.sosTriggeredAt)}` : ""}. This does not confirm SMS delivery.`
            : null,
      };
    });

    return [...scamActivities, ...journeyActivities]
      .filter((item) => filter === "all" || item.type === filter)
      .sort((a, b) => b.sortTime - a.sortTime);
  }, [scans, journeys, filter]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans-ui">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs shrink-0">
            <History size={25} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E0E32] dark:text-[#FB7185]">
              YOUR RECENT ACTIVITY
            </p>
            <h1 className="font-serif-editorial text-3xl font-bold text-[#111318] dark:text-[#F8FAFC] sm:text-4xl">
              Activity History
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-[#94A3B8]">
          Review your journey records and saved scam checks in one place.
        </p>
      </section>

      <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-[#111318] dark:text-[#F8FAFC]">
              Activity records
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#94A3B8]">
              {loading
                ? "Loading records..."
                : `${activities.length} ${
                    activities.length === 1
                      ? "activity record"
                      : "activity records"
                  }`}
            </p>
            {!loading && (
              <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                {journeys.length} journeys · {scans.length} scam checks
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Filter size={16} className="text-[#6B7280] dark:text-[#94A3B8]" />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3 py-2 text-xs font-semibold text-[#111318] dark:text-[#F8FAFC] outline-none focus:border-[#7E0E32] dark:focus:border-[#FB7185] transition"
              aria-label="Filter activity"
            >
              <option value="all">All activity</option>
              <option value="journey">Journeys</option>
              <option value="scam">Scam checks</option>
            </select>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2 text-xs font-semibold text-[#111318] dark:text-[#F8FAFC] hover:bg-[#FFF4EC] dark:hover:bg-[#253146] disabled:opacity-50 transition"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {partialErrors.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-xs text-amber-900 dark:text-amber-300">
                  Some history could not be loaded
                </p>
                {partialErrors.map((message) => (
                  <p
                    key={message}
                    className="mt-1 break-words text-xs text-amber-800 dark:text-amber-400"
                  >
                    {message}
                  </p>
                ))}
                <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-500">
                  Check that the journey-history endpoint exists on your deployed backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs font-medium text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="py-10 text-center text-[#6B7280] dark:text-[#94A3B8]">
              <RefreshCw className="mx-auto animate-spin text-[#7E0E32] dark:text-[#FB7185]" size={24} />
              <p className="mt-3 text-xs">Fetching your activity history...</p>
            </div>
          )}

          {!loading &&
            activities.map((item) => {
              const isJourney = item.type === "journey";
              const Icon = isJourney
                ? item.status === "Overdue"
                  ? Siren
                  : item.status === "Completed"
                    ? CheckCircle2
                    : Navigation
                : ShieldCheck;

              return (
                <article
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFFDFB] dark:bg-[#1A2233] p-4 transition hover:border-[#7E0E32]/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-[#111318] dark:text-[#F8FAFC]">
                        {item.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusStyle(
                          item.status,
                          item.type
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="rounded-full border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B7280] dark:text-[#94A3B8]">
                        {isJourney ? "Journey" : "Scam check"}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-xs leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                      {item.detail}
                    </p>

                    {item.explanation && (
                      <p className="mt-1.5 break-words text-xs leading-relaxed text-[#6B7280] dark:text-[#94A3B8]">
                        {item.explanation}
                      </p>
                    )}

                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                      <Clock size={12} />
                      {item.time}
                    </p>
                  </div>
                </article>
              );
            })}

          {!loading && activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5]/50 dark:bg-[#111622]/50 py-12 text-center">
              <Search className="mx-auto text-[#6B7280] dark:text-[#94A3B8]" size={26} />
              <p className="mt-3.5 font-bold text-sm text-[#111318] dark:text-[#F8FAFC]">
                No records in this category
              </p>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                {filter === "journey"
                  ? "Your saved journeys will appear here once the history API is available."
                  : filter === "scam"
                    ? "Your saved scam checks will appear here."
                    : "No journey or scam-check records were returned."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

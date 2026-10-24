
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
        return "bg-red-50 text-red-700";
      case "Suspicious":
        return "bg-amber-50 text-amber-700";
      case "Low risk":
        return "bg-yellow-50 text-yellow-700";
      case "Safe":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  switch (String(status).toLowerCase()) {
    case "active":
      return "bg-blue-50 text-blue-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    case "overdue":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
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
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <History size={27} />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-700">
              YOUR RECENT ACTIVITY
            </p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Activity History
            </h2>
          </div>
        </div>

        <p className="mt-4 text-slate-500">
          Review your journey records and saved scam checks in one place.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-slate-900">
              Activity records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading records..."
                : `${activities.length} ${
                    activities.length === 1
                      ? "activity record"
                      : "activity records"
                  }`}
            </p>
            {!loading && (
              <p className="mt-1 text-xs text-slate-400">
                {journeys.length} journeys · {scans.length} scam checks
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={17} className="text-slate-500" />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500"
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {partialErrors.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <p className="font-medium text-amber-900">
                  Some history could not be loaded
                </p>
                {partialErrors.map((message) => (
                  <p
                    key={message}
                    className="mt-1 break-words text-sm text-amber-800"
                  >
                    {message}
                  </p>
                ))}
                <p className="mt-2 text-sm text-amber-800">
                  Check that the journey-history endpoint exists on your deployed backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="py-10 text-center text-slate-500">
              <RefreshCw className="mx-auto animate-spin" size={26} />
              <p className="mt-3 text-sm">Fetching your activity history...</p>
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
                  className="flex items-start gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          item.status,
                          item.type
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {isJourney ? "Journey" : "Scam check"}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {item.detail}
                    </p>

                    {item.explanation && (
                      <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                        {item.explanation}
                      </p>
                    )}

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={13} />
                      {item.time}
                    </p>
                  </div>
                </article>
              );
            })}

          {!loading && activities.length === 0 && (
            <div className="py-10 text-center">
              <Search className="mx-auto text-slate-400" size={28} />
              <p className="mt-3 font-medium text-slate-700">
                No records in this category
              </p>
              <p className="mt-1 text-sm text-slate-500">
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

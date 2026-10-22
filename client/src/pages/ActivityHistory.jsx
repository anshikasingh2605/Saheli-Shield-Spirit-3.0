
import { useEffect, useMemo, useState } from "react";
import {
  History,
  MapPin,
  ShieldCheck,
  Search,
  Clock,
  Filter,
  Info,
  RefreshCw,
  AlertCircle,
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

function formatRisk(value) {
  const labels = {
    safe: "Safe",
    low_risk: "Low risk",
    potentially_suspicious: "Suspicious",
    high_risk: "High risk",
  };

  return labels[value] || value || "Analyzed";
}

function getRiskStyle(value) {
  switch (value) {
    case "high_risk":
      return "bg-red-50 text-red-700";
    case "potentially_suspicious":
      return "bg-amber-50 text-amber-700";
    case "low_risk":
      return "bg-yellow-50 text-yellow-700";
    case "safe":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function extractHistory(responseData) {
  // Support common API response shapes without assuming
  // that the backend always returns the same wrapper.
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData?.scans)) {
    return responseData.scans;
  }

  if (Array.isArray(responseData?.history)) {
    return responseData.history;
  }

  if (Array.isArray(responseData?.records)) {
    return responseData.records;
  }

  return null;
}

export default function ActivityHistory() {
  const [filter, setFilter] = useState("all");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/scams/history");
      const history = extractHistory(response.data?.data);

      if (history === null) {
        throw new Error(
          "The history response format was unexpected. Check the API response."
        );
      }

      setScans(history);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load scam history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const activities = useMemo(() => {
    return scans
      .map((scan, index) => {
        const riskLevel = scan.riskLevel || scan.result?.riskLevel;

        return {
          id: scan._id || scan.id || scan.scanId || `scan-${index}`,
          type: "scam",
          title: "Scam message analysis",
          detail:
            scan.message ||
            scan.url ||
            scan.content ||
            scan.explanation ||
            "Scam analysis completed.",
          status: formatRisk(riskLevel),
          riskLevel,
          time: formatDate(
            scan.createdAt ||
              scan.updatedAt ||
              scan.timestamp ||
              scan.scannedAt
          ),
          explanation: scan.explanation || scan.result?.explanation,
        };
      })
      .filter((item) => filter === "all" || item.type === filter);
  }, [scans, filter]);

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
          Review your saved scam checks and journey activity.
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
                : `${activities.length} scam check ${
                    activities.length === 1 ? "record" : "records"
                  }`}
            </p>
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

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                Could not load activity
              </p>
              <p className="mt-1 break-words text-sm text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchHistory}
                className="mt-2 text-sm font-semibold text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="py-10 text-center text-slate-500">
              <RefreshCw
                className="mx-auto animate-spin"
                size={26}
              />
              <p className="mt-3 text-sm">
                Fetching your saved scam checks...
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            activities.map((item) => {
              const isJourney = item.type === "journey";
              const Icon = isJourney ? MapPin : ShieldCheck;

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
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          getRiskStyle(item.riskLevel)
                        }`}
                      >
                        {item.status}
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

          {!loading && !error && activities.length === 0 && (
            <div className="py-10 text-center">
              <Search
                className="mx-auto text-slate-400"
                size={28}
              />
              <p className="mt-3 font-medium text-slate-700">
                No records in this category
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {filter === "journey"
                  ? "Journey history is not connected yet."
                  : "Your saved scam checks will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <Info
          className="mt-0.5 shrink-0 text-violet-700"
          size={19}
        />
        <p className="text-sm leading-6 text-violet-900">
          Scam-check records are fetched from your backend. Journey
          history will be integrated separately when its history
          endpoint is available.
        </p>
      </div>
    </div>
  );
}

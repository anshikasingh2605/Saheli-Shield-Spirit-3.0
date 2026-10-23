
import { useEffect, useRef, useState } from "react";
import LeafletRouteMap from "../components/LeafletRouteMap";
import {
  MapPin,
  Navigation,
  Clock,
  Route,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Play,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import { Star, MapPinned } from "lucide-react";

const geocodePlace = async (place) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(place)}`
  );

  if (!response.ok) {
    throw new Error("Unable to look up this location. Please try again.");
  }

  const results = await response.json();

  if (!results.length) {
    throw new Error(`Location not found: ${place}`);
  }

  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
    label: place,
  };
};

export default function SaheliRoute() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [originPoint, setOriginPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState("idle");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Location sharing is off.");
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationWatchIdRef = useRef(null);
  const lastLocationSentRef = useRef(0);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const getError = (err) =>
    err.response?.data?.message ||
    err.message ||
    "Something went wrong. Please try again.";

  const loadActiveJourney = async () => {
    try {
      const response = await api.get("/journeys/active");
      const journey = response.data?.data;

      setActiveJourney(journey || null);

      if (journey) {
        setJourneyStatus("active");
        setStart(journey.origin?.label || "");
        setDestination(journey.destination?.label || "");
        setOriginPoint(journey.origin);
        setDestinationPoint(journey.destination);
        setNotice("Your active journey was restored from the backend.");
      } else {
        setJourneyStatus("idle");
      }
    } catch (err) {
      setError(getError(err));
    }
  };

  useEffect(() => {
    loadActiveJourney();
  }, []);

  // Restore route geometry when available on the saved journey.
  const refreshRouteFeedback = async (routeRef) => {
    if (!routeRef) return;
    try {
      const response = await api.get("/routes/feedback", { params: { routeRef, limit: 10 } });
      const items = response.data?.data;
      setFeedbackItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.warn("Could not load route feedback", err);
    }
  };

  const stopLocationTracking = () => {
    if (locationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    setTracking(false);
    setLocationStatus("Location sharing is paused.");
  };

  const startLocationTracking = () => {
    if (!activeJourney?._id) {
      setLocationStatus("Start a journey before sharing live location.");
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus("This browser does not support geolocation.");
      return;
    }
    if (!window.isSecureContext) {
      setLocationStatus("Location requires HTTPS or localhost.");
      return;
    }

    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
    }

    setError("");
    setLocationStatus("Waiting for browser location permission...");
    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
          isSimulated: false,
        };
        setCurrentLocation(location);
        setLocationStatus(`Location available (accuracy ±${Math.round(location.accuracy)} m).`);

        const now = Date.now();
        if (now - lastLocationSentRef.current < 10000) return;
        lastLocationSentRef.current = now;

        try {
          await api.patch(`/journeys/${activeJourney._id}/location`, location);
          setLocationStatus(`Live location shared at ${new Date().toLocaleTimeString()}.`);
        } catch (err) {
          setLocationStatus("Location was detected, but the server could not save it.");
          setError(getError(err));
        }
      },
      (geoError) => {
        const messages = {
          1: "Location permission denied. Allow Location for this site in browser settings, then try again.",
          2: "Your location could not be determined. Check device location/GPS and network.",
          3: "Location request timed out. Try enabling location again.",
        };
        setLocationStatus(messages[geoError.code] || `Location error: ${geoError.message}`);
        setTracking(false);
        if (locationWatchIdRef.current !== null) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
          locationWatchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    setTracking(true);
  };

  useEffect(() => {
    return () => {
      if (locationWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, []);

  const extendEta = async () => {
    if (!activeJourney?._id) return;
    setJourneyLoading(true); setError(""); setNotice("");
    try {
      const response = await api.patch(`/journeys/${activeJourney._id}/extend`, { additionalMinutes: Number(etaMinutes) });
      const updated = response.data?.data;
      setActiveJourney((current) => current ? { ...current, eta: updated?.eta || current.eta, extendedMinutes: updated?.extendedMinutes ?? current.extendedMinutes } : current);
      setNotice(`ETA extended by ${etaMinutes} minutes.`);
    } catch (err) { setError(getError(err)); }
    finally { setJourneyLoading(false); }
  };

  const submitRouteFeedback = async (event) => {
    event.preventDefault();
    if (!selectedRoute?.routeId) { setError("Select a route before submitting feedback."); return; }
    setFeedbackLoading(true); setError(""); setNotice("");
    try {
      await api.post("/routes/feedback", {
        journeyId: activeJourney?._id || undefined,
        routeRef: selectedRoute.routeId,
        originLabel: originPoint?.label || start,
        destinationLabel: destinationPoint?.label || destination,
        rating: Number(feedbackRating),
        comment: feedbackComment.trim(),
        safetyTags: [],
        timeOfDay: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening",
        travelDurationMinutes: Number(selectedRoute.durationMinutes) || 0,
      });
      setFeedbackComment("");
      setNotice("Thank you. Your route feedback was submitted.");
      await refreshRouteFeedback(selectedRoute.routeId);
    } catch (err) { setError(getError(err)); }
    finally { setFeedbackLoading(false); }
  };

  const handleFindRoutes = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!start.trim() || !destination.trim()) {
      setError("Please enter both your starting point and destination.");
      return;
    }

    if (start.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError("Your starting point and destination must be different.");
      return;
    }

    if (activeJourney) {
      setError("Complete your active journey before planning another one.");
      return;
    }

    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);
    setOriginPoint(null);
    setDestinationPoint(null);

    try {
      const origin = await geocodePlace(start.trim());
      const destinationLocation = await geocodePlace(
        destination.trim()
      );

      const response = await api.post("/routes/calculate", {
        origin,
        destination: destinationLocation,
      });

      const result = response.data?.data;
      const routeOptions = Array.isArray(result)
        ? result
        : result?.routes;

      if (!Array.isArray(routeOptions) || routeOptions.length === 0) {
        throw new Error("No route options were returned by the backend.");
      }

      setOriginPoint(origin);
      setDestinationPoint(destinationLocation);
      setRoutes(routeOptions);
      setSelectedRoute(routeOptions[0]);
      setJourneyStatus("idle");
      setNotice(
        "Routes loaded successfully. Your map is ready. Select a route to start your journey."
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async () => {
    if (!selectedRoute || !originPoint || !destinationPoint) {
      setError("Find a route before starting your journey.");
      return;
    }

    setJourneyLoading(true);
    setError("");
    setNotice("");

    try {
      const durationMinutes =
        Number(selectedRoute.durationMinutes) || 30;

      const eta = new Date(
        Date.now() + (durationMinutes + 10) * 60 * 1000
      ).toISOString();

      const response = await api.post("/journeys", {
        origin: originPoint,
        destination: destinationPoint,
        routeRef: selectedRoute.routeId,
        routeType: selectedRoute.type,
        eta,
      });

      const journey = response.data?.data;

      if (!journey?._id) {
        throw new Error("The backend did not return a journey ID.");
      }

      setActiveJourney(journey);
      setJourneyStatus("active");
      setNotice("Journey started and saved successfully.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setJourneyLoading(false);
    }
  };

  const completeJourney = async () => {
    if (!activeJourney?._id) return;

    setJourneyLoading(true);
    setError("");
    setNotice("");

    try {
      await api.post(`/journeys/${activeJourney._id}/complete`);

      stopLocationTracking();
      setActiveJourney(null);
      setJourneyStatus("completed");
      if (selectedRoute?.routeId) await refreshRouteFeedback(selectedRoute.routeId);
      setNotice("Journey completed and updated in the backend.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleSOS = async () => {
    if (!activeJourney?._id) {
      setError(
        "There is no active journey. Start a journey before triggering SOS."
      );
      return;
    }

    const confirmed = window.confirm(
      "Send an emergency SOS request for your active journey? Continue only if you need emergency assistance."
    );

    if (!confirmed) return;

    setJourneyLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.post(
        `/journeys/${activeJourney._id}/sos`
      );

      const result = response.data?.data;

      setNotice(
        `SOS request processed. The backend reports ${
          result?.notifiedContactsCount ?? 0
        } trusted contact(s) selected for notification. Verify delivery in the backend.`
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setJourneyLoading(false);
    }
  };

  const resetJourney = () => {
    setRoutes([]);
    setSelectedRoute(null);
    setOriginPoint(null);
    setDestinationPoint(null);
    setJourneyStatus("idle");
    setStart("");
    setDestination("");
    setNotice("");
    setError("");
  };

  const formatDistance = (value) =>
    value != null ? `${value} km` : "Unavailable";

  const formatDuration = (value) =>
    value != null ? `${value} min` : "Unavailable";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Navigation size={27} />
          </div>

          <div>
            <p className="text-sm font-medium text-violet-700">
              TRAVEL SAFETY
            </p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Every journey, with more confidence.
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Plan your trip, compare route options, and manage your
          journey safety controls.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Route className="text-violet-700" size={21} />
            <h3 className="font-semibold text-slate-900">
              Plan your journey
            </h3>
          </div>

          <form onSubmit={handleFindRoutes} className="space-y-5">
            <div>
              <label
                htmlFor="start-location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Starting point
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                <MapPin
                  size={19}
                  className="shrink-0 text-emerald-600"
                />
                <input
                  id="start-location"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  placeholder="e.g. Lucknow Railway Station"
                  disabled={journeyStatus === "active"}
                  className="min-w-0 flex-1 py-3 outline-none disabled:bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="destination-location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Destination
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-violet-500">
                <MapPin
                  size={19}
                  className="shrink-0 text-red-500"
                />
                <input
                  id="destination-location"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                  placeholder="e.g. Hazratganj, Lucknow"
                  disabled={journeyStatus === "active"}
                  className="min-w-0 flex-1 py-3 outline-none disabled:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || journeyStatus === "active"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Navigation size={18} />
              )}
              {loading ? "Finding routes..." : "Find routes"}
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {notice && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600"
            >
              {notice}
            </p>
          )}

          {routes.length > 0 && (
            <div className="mt-7">
              <h4 className="mb-3 font-semibold text-slate-900">
                Route options
              </h4>

              <div className="space-y-3">
                {routes.map((routeOption, index) => (
                  <button
                    type="button"
                    key={routeOption.routeId || index}
                    onClick={() => { setSelectedRoute(routeOption); refreshRouteFeedback(routeOption.routeId); }}
                    disabled={journeyStatus === "active"}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedRoute === routeOption
                        ? "border-violet-500 bg-violet-50 ring-1 ring-violet-200"
                        : "border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {routeOption.title ||
                            routeOption.type ||
                            `Route ${index + 1}`}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {routeOption.description ||
                            (routeOption.safetyHighlights || []).join(" · ")}
                        </p>
                      </div>

                      {selectedRoute === routeOption && (
                        <CheckCircle2
                          className="shrink-0 text-violet-700"
                          size={20}
                        />
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Route size={15} />
                        {formatDistance(routeOption.distanceKm)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={15} />
                        {formatDuration(routeOption.durationMinutes)}
                      </span>

                      {Number.isFinite(Number(routeOption.safetyScore)) && routeOption.safetyScore !== null ? (
                        <span className="font-medium text-emerald-700">
                          Safety score: {routeOption.safetyScore}/10
                        </span>
                      ) : (
                        <span className="font-medium text-amber-700">
                          Safety score unavailable · insufficient verified data
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {journeyStatus !== "active" &&
                journeyStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={startJourney}
                    disabled={journeyLoading || !selectedRoute}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {journeyLoading ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    Start journey
                  </button>
                )}

              {journeyStatus === "completed" && (
                <button
                  type="button"
                  onClick={resetJourney}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={17} />
                  Plan another journey
                </button>
              )}
            </div>
          )}
        </section>

        <div className="space-y-5">
          {/* Real interactive map replaces the old placeholder */}
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-3 px-2 font-semibold text-slate-900">
              Your journey map
            </h3>

<LeafletRouteMap
  originPoint={originPoint}
  destinationPoint={destinationPoint}
  routes={routes}
  selectedRoute={selectedRoute}
/>
            {originPoint && destinationPoint && (
              <p className="mt-3 break-words px-2 text-sm text-slate-500">
                {originPoint.label || start} →{" "}
                {destinationPoint.label || destination}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 text-emerald-700"
                size={23}
              />

              <div>
                <h3 className="font-semibold text-slate-900">
                  Journey status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {journeyStatus === "active"
                    ? "Active journey saved on the server"
                    : journeyStatus === "completed"
                      ? "Journey completed"
                      : "No active journey"}
                </p>
              </div>
            </div>

            {journeyStatus === "active" && (
              <div className="mt-4 space-y-3">
                <button type="button" onClick={tracking ? stopLocationTracking : startLocationTracking} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold ${tracking ? "bg-amber-100 text-amber-800" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  <MapPinned size={18} /> {tracking ? "Pause live location tracking" : "Enable live location tracking"}
                </button>
                <p role="status" aria-live="polite" className="text-sm text-slate-600">{locationStatus}</p>
                {currentLocation && <p className="text-xs text-slate-500">Last GPS fix: {new Date(currentLocation.timestamp).toLocaleTimeString()} · {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}</p>}
                <div className="flex gap-2">
                  <select value={etaMinutes} onChange={(e) => setEtaMinutes(Number(e.target.value))} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value={15}>Extend ETA by 15 min</option><option value={30}>Extend ETA by 30 min</option><option value={60}>Extend ETA by 60 min</option><option value={120}>Extend ETA by 120 min</option>
                  </select>
                  <button type="button" onClick={extendEta} disabled={journeyLoading} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Extend ETA</button>
                </div>
                {activeJourney?.eta && <p className="text-sm text-slate-500">Expected arrival: {new Date(activeJourney.eta).toLocaleString()}</p>}
              </div>
            )}

            {journeyStatus === "active" && (
              <button
                type="button"
                onClick={completeJourney}
                disabled={journeyLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {journeyLoading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Complete journey
              </button>
            )}

            {journeyStatus === "completed" && (
              <button
                type="button"
                onClick={resetJourney}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={17} />
                Plan another journey
              </button>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleSOS}
                disabled={journeyLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                <Phone size={19} />
                SOS — Emergency help
              </button>

              <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-amber-600"
                  size={15}
                />
                SOS requests use the backend. Actual emergency
                notifications depend on the server configuration and
                successful delivery.
              </p>
            </div>
          </section>

          {selectedRoute && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2"><Star className="text-amber-500" size={20} /><h3 className="font-semibold text-slate-900">Route feedback</h3></div>
              <form onSubmit={submitRouteFeedback} className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Your rating</label>
                <select value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2"><option value={5}>5 - Excellent</option><option value={4}>4 - Good</option><option value={3}>3 - Average</option><option value={2}>2 - Poor</option><option value={1}>1 - Very poor</option></select>
                <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} maxLength={1000} rows={3} placeholder="Share helpful details about this route (optional)" className="w-full rounded-xl border border-slate-200 p-3 text-sm" />
                <button disabled={feedbackLoading} className="w-full rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{feedbackLoading ? "Submitting..." : "Submit route feedback"}</button>
              </form>
              <p className="mt-3 text-xs leading-5 text-slate-500">Community feedback is informational and is not a guarantee of route safety.</p>
              {feedbackItems.length > 0 && <div className="mt-4 space-y-3 border-t border-slate-100 pt-4"><h4 className="text-sm font-semibold">Recent feedback</h4>{feedbackItems.map((item) => <div key={item._id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-medium">{item.authorName || "Traveller"} · {item.rating}/5</p>{item.comment && <p className="mt-1 text-sm text-slate-600">{item.comment}</p>}<p className="mt-1 text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p></div>)}</div>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

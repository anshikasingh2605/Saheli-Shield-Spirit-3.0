
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

const getFeedbackStorageKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("sahelishield_user") || "null");
    const identity = user?.id || user?._id || user?.email || "current-user";
    return `sahelishield_pending_route_feedback_${identity}`;
  } catch {
    return "sahelishield_pending_route_feedback_current-user";
  }
};

export default function SaheliRoute({ initialStart = "", initialDestination = "" }) {
  const [start, setStart] = useState(initialStart || "");
  const [destination, setDestination] = useState(initialDestination || "");
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
  const [feedbackContext, setFeedbackContext] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getFeedbackStorageKey()) || "null");
    } catch {
      return null;
    }
  });

  const getError = (err) =>
    err.response?.data?.message ||
    err.message ||
    "Something went wrong. Please try again.";

  const loadActiveJourney = async () => {
    try {
      const response = await api.get("/journeys/active");
      const journey = response.data?.data;

      setActiveJourney(journey || null);
      if (journey?.lastLocation && Number.isFinite(Number(journey.lastLocation.lat)) && Number.isFinite(Number(journey.lastLocation.lng))) {
        setCurrentLocation({
          lat: Number(journey.lastLocation.lat),
          lng: Number(journey.lastLocation.lng),
          accuracy: Number(journey.lastLocation.accuracy || 0),
          timestamp: journey.lastLocation.updatedAt || journey.updatedAt || new Date().toISOString(),
          isSimulated: Boolean(journey.lastLocation.isSimulated),
        });
        setLocationStatus(journey.lastLocation.isSimulated
          ? "Last saved position was simulated, not live GPS."
          : "Showing last saved location. Enable tracking for a fresh GPS fix.");
      } else {
        setCurrentLocation(null);
      }

      if (journey) {
        setJourneyStatus("active");
        setStart(journey.origin?.label || "");
        setDestination(journey.destination?.label || "");
        setOriginPoint(journey.origin);
        setDestinationPoint(journey.destination);
        // Geometry is not stored in the Journey model, so request fresh route
        // options and match the saved route reference when the page is restored.
        try {
          const routeResponse = await api.post("/routes/calculate", {
            origin: journey.origin,
            destination: journey.destination,
          });
          const payload = routeResponse.data?.data;
          const restoredRoutes = Array.isArray(payload) ? payload : payload?.routes;
          if (Array.isArray(restoredRoutes) && restoredRoutes.length) {
            setRoutes(restoredRoutes);
            const matched = restoredRoutes.find((item) => item.routeId === journey.routeRef)
              || restoredRoutes.find((item) => item.type === journey.routeType)
              || restoredRoutes[0];
            setSelectedRoute(matched);
          } else {
            setRoutes([]);
            setSelectedRoute(null);
          }
        } catch (routeError) {
          console.warn("Could not restore route geometry", routeError);
          setRoutes([]);
          setSelectedRoute(null);
        }
        setNotice("Your active journey was restored. Enable live location sharing to update your GPS position.");
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

  const startLocationTracking = (journeyId = activeJourney?._id) => {
    if (!journeyId) {
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
          await api.patch(`/journeys/${journeyId}/location`, location);
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
    if (!feedbackContext?.routeRef) {
      setError("Complete a journey before submitting route feedback.");
      return;
    }

    setFeedbackLoading(true);
    setError("");
    setNotice("");
    try {
      await api.post("/routes/feedback", {
        journeyId: feedbackContext.journeyId || undefined,
        routeRef: feedbackContext.routeRef,
        originLabel: feedbackContext.originLabel || start,
        destinationLabel: feedbackContext.destinationLabel || destination,
        rating: Number(feedbackRating),
        comment: feedbackComment.trim(),
        safetyTags: [],
        timeOfDay: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening",
        travelDurationMinutes: Number(feedbackContext.durationMinutes) || 0,
      });

      setFeedbackComment("");
      setFeedbackContext(null);
      localStorage.removeItem(getFeedbackStorageKey());
      setNotice("Thank you. Your feedback was submitted. It will be available again after you complete another journey.");
      await refreshRouteFeedback(feedbackContext.routeRef);
    } catch (err) {
      setError(getError(err));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleFindRoutes = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
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

      // Detect user's local time of day so backend applies time-sensitive safety scoring
      const getTimeOfDay = () => {
        const h = new Date().getHours();
        if (h >= 23 || h < 5) return "late_night";
        if (h >= 19) return "night";
        if (h >= 16) return "evening";
        if (h >= 12) return "afternoon";
        return "morning";
      };

      const response = await api.post("/routes/calculate", {
        origin,
        destination: destinationLocation,
        timeOfDay: getTimeOfDay(),
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
      setError("Find and select a route before starting your journey.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Location is required to start a journey, but this browser does not support geolocation.");
      return;
    }

    if (!window.isSecureContext) {
      setError("Location permission requires HTTPS or localhost. Open the secure version of this site and try again.");
      return;
    }

    setJourneyLoading(true);
    setError("");
    setNotice("Requesting your current location. A journey cannot start without location permission.");

    try {
      // Mandatory fresh GPS fix BEFORE creating the journey.
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      });

      const initialLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
        isSimulated: false,
      };
      setCurrentLocation(initialLocation);
      setLocationStatus(`GPS permission granted (accuracy ±${Math.round(initialLocation.accuracy)} m). Starting journey...`);

      const durationMinutes = Number(selectedRoute.durationMinutes) || 30;
      const eta = new Date(Date.now() + (durationMinutes + 10) * 60 * 1000).toISOString();

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

      try {
        await api.patch(`/journeys/${journey._id}/location`, initialLocation);
      } catch (locationError) {
        // Fail closed: do not leave an active journey that has no confirmed initial GPS save.
        try { await api.post(`/journeys/${journey._id}/complete`); } catch { /* keep the original location error */ }
        setActiveJourney(null);
        setJourneyStatus("idle");
        setCurrentLocation(null);
        throw new Error(`Your location permission was granted, but the backend could not save your initial GPS position. The journey was not started. ${getError(locationError)}`);
      }

      lastLocationSentRef.current = Date.now();
      // Start continuous tracking immediately, using the newly created journey ID.
      startLocationTracking(journey._id);
      setNotice("Journey started. Your current GPS position was saved and live location tracking is enabled.");
    } catch (err) {
      const geoMessages = {
        1: "Location permission is required. Allow location access in your browser settings, then press Start journey again.",
        2: "Your current location could not be determined. Enable device GPS/location and try again.",
        3: "Getting your current location timed out. Move to an area with better GPS/network signal and try again.",
      };
      if (typeof err?.code === "number" && geoMessages[err.code]) {
        setError(geoMessages[err.code]);
      } else {
        setError(getError(err));
      }
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
      const completedFeedbackContext = {
        journeyId: activeJourney._id,
        routeRef: selectedRoute?.routeId || activeJourney.routeRef,
        originLabel: originPoint?.label || activeJourney.origin?.label || start,
        destinationLabel: destinationPoint?.label || activeJourney.destination?.label || destination,
        durationMinutes: Number(selectedRoute?.durationMinutes) || 0,
        completedAt: new Date().toISOString(),
      };
      setActiveJourney(null);
      setCurrentLocation(null);
      setJourneyStatus("completed");
      if (completedFeedbackContext.routeRef) {
        setFeedbackContext(completedFeedbackContext);
        localStorage.setItem(getFeedbackStorageKey(), JSON.stringify(completedFeedbackContext));
        await refreshRouteFeedback(completedFeedbackContext.routeRef);
      }
      setNotice("Journey completed and saved. You can now submit feedback for this journey.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleSOS = async () => {
    if (!activeJourney?._id) {
      setError("There is no active journey. Start a journey before triggering SOS.");
      return;
    }

    const confirmed = window.confirm(
      "Send an emergency SOS email to your consented trusted contacts? Continue only if you need emergency assistance."
    );
    if (!confirmed) return;

    setJourneyLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post(`/journeys/${activeJourney._id}/sos`);
      const result = response.data?.data;
      const dispatches = Array.isArray(result?.dispatchDetails) ? result.dispatchDetails : [];
      const sent = dispatches.filter((item) => item?.delivery?.sent === true).length;
      const failed = dispatches.filter((item) => item?.delivery?.sent !== true).length;
      const details = dispatches.map((item) => {
        const recipient = item?.email || item?.phone || item?.name || "Trusted contact";
        const delivery = item?.delivery || {};
        if (delivery.sent === true) {
          return `${recipient}: accepted by email provider; inbox delivery is not guaranteed.`;
        }
        return `${recipient}: email failed${delivery.error ? ` (${delivery.error})` : "."}`;
      });

      const summary = result?.notifiedContactsCount === 0 || dispatches.length === 0
        ? "SOS request reached the server, but no email delivery results were returned. Check that you have saved trusted contacts with valid email addresses and consent."
        : `SOS email processing finished: ${sent} accepted by the email provider, ${failed} failed. Provider acceptance does not guarantee inbox delivery.`;

      setNotice([
        summary,
        result?.mapLink ? `Location link: ${result.mapLink}` : "No map link was returned by the server.",
        ...details,
      ].filter(Boolean).join("\n"));
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
    <div className="mx-auto max-w-6xl space-y-6 font-sans-ui">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs shrink-0">
            <Navigation size={24} />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E0E32] dark:text-[#FB7185]">
              TRAVEL SAFETY
            </p>
            <h2 className="font-serif-editorial text-3xl font-bold text-[#111318] dark:text-[#F8FAFC] sm:text-4xl">
              Every journey, with more confidence.
            </h2>
          </div>
        </div>

        <p className="mt-3 max-w-2xl leading-relaxed text-sm sm:text-base text-[#4B5563] dark:text-[#94A3B8]">
          Plan your trip, compare route options, and manage your
          journey safety controls.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 sm:p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2">
            <Route className="text-[#7E0E32] dark:text-[#FB7185]" size={20} />
            <h3 className="font-serif-editorial text-xl font-bold text-[#111318] dark:text-[#F1F5F9]">
              Plan your journey
            </h3>
          </div>

          <form onSubmit={handleFindRoutes} className="space-y-4">
            <div>
              <label
                htmlFor="start-location"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
              >
                Starting point
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15 transition-all">
                <MapPin
                  size={18}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <input
                  id="start-location"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  placeholder="e.g. Lucknow Railway Station"
                  disabled={journeyStatus === "active"}
                  className="min-w-0 flex-1 py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="destination-location"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]"
              >
                Destination
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15 transition-all">
                <MapPin
                  size={18}
                  className="shrink-0 text-rose-500"
                />
                <input
                  id="destination-location"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                  placeholder="e.g. Hazratganj, Lucknow"
                  disabled={journeyStatus === "active"}
                  className="min-w-0 flex-1 py-3 outline-none text-sm text-[#111318] dark:text-[#F1F5F9] bg-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || journeyStatus === "active"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#7E0E32]/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={17} />
              ) : (
                <Navigation size={17} />
              )}
              {loading ? "Finding routes..." : "Find routes"}
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-bold leading-5 text-red-700 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {notice && (
            <p
              role="status"
              className="mt-4 whitespace-pre-line rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#0B0E14] p-3.5 text-xs leading-5 text-[#4B5563] dark:text-[#94A3B8]"
            >
              {notice}
            </p>
          )}

          {routes.length > 0 && (
            <div className="mt-7">
              <h4 className="font-serif-editorial mb-3 text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">
                Route options
              </h4>

              <div className="space-y-3">
                {routes.map((routeOption, index) => (
                  <button
                    type="button"
                    key={routeOption.routeId || index}
                    onClick={() => { setSelectedRoute(routeOption); refreshRouteFeedback(routeOption.routeId); }}
                    disabled={journeyStatus === "active"}
                    className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${
                      selectedRoute === routeOption
                        ? "border-[#7E0E32] bg-[#7E0E32]/5 dark:border-[#FB7185] dark:bg-[#FB7185]/10 ring-1 ring-[#7E0E32]/30"
                        : "border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] hover:border-[#7E0E32]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>                        {/* Use backend title; fall back to type label */}
                        <p className="font-bold text-[#111318] dark:text-[#F1F5F9]">
                          {routeOption.title ||
                            (routeOption.type === "safer"
                              ? `Route ${index + 1} · Safer Route`
                              : routeOption.type === "faster"
                                ? `Route ${index + 1} · Faster Route`
                                : routeOption.type === "balanced"
                                  ? `Route ${index + 1} · Balanced Route`
                                  : `Route ${index + 1} · Route`)}
                        </p>

                        {/* Use backend description if available */}
                        <p className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                          {routeOption.description ||
                            (routeOption.polyline || (Array.isArray(routeOption.coordinates) && routeOption.coordinates.length > 1)
                              ? "Road geometry provided by routing service."
                              : "Estimated route — no live road geometry available.")}
                        </p>
                      </div>

                      {selectedRoute === routeOption && (
                        <CheckCircle2
                          className="shrink-0 text-[#7E0E32] dark:text-[#FB7185]"
                          size={20}
                        />
                      )}
                    </div>

                    {/* Stats row: distance · duration · safety score */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-[#4B5563] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Route size={14} />
                        {formatDistance(routeOption.distanceKm)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(routeOption.durationMinutes)}
                      </span>

                      {/* Safety score from backend */}
                      {Number.isFinite(Number(routeOption.safetyScore)) ? (
                        <span
                          className={`font-bold ${
                            Number(routeOption.safetyScore) >= 8.5
                              ? "text-emerald-700 dark:text-emerald-400"
                              : Number(routeOption.safetyScore) >= 7
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          🛡 Safety {routeOption.safetyScore}/10
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">
                          Safety score pending
                        </span>
                      )}
                    </div>

                    {/* Safety highlights from backend */}
                    {Array.isArray(routeOption.safetyHighlights) && routeOption.safetyHighlights.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {routeOption.safetyHighlights.map((highlight, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5 text-xs text-slate-500">
                            <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>

              {journeyStatus !== "active" &&
                journeyStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={startJourney}
                    disabled={journeyLoading || !selectedRoute}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#0D9488]/20 disabled:opacity-60 transition cursor-pointer"
                  >
                    {journeyLoading ? (
                      <RefreshCw className="animate-spin" size={17} />
                    ) : (
                      <Play size={17} />
                    )}
                    Start journey
                  </button>
                )}

              {journeyStatus === "completed" && (
                <button
                  type="button"
                  onClick={resetJourney}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] px-4 py-3 text-sm font-bold text-[#111318] dark:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <RotateCcw size={16} />
                  Plan another journey
                </button>
              )}
            </div>
          )}
        </section>

        <div className="space-y-5">
          {/* Real interactive map */}
          <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-3.5 shadow-xs">
            <h3 className="font-serif-editorial mb-3 px-2 text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">
              Your journey map
            </h3>

            <LeafletRouteMap
              originPoint={originPoint}
              destinationPoint={destinationPoint}
              routes={routes}
              selectedRoute={selectedRoute}
              currentLocation={currentLocation}
            />
            {originPoint && destinationPoint && (
              <p className="mt-3 break-words px-2 text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">
                {originPoint.label || start} →{" "}
                {destinationPoint.label || destination}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                size={22}
              />

              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">
                  Journey status
                </h3>

                <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#94A3B8]">
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
                <button
                  type="button"
                  onClick={tracking ? stopLocationTracking : startLocationTracking}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition cursor-pointer ${
                    tracking
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "border border-[#DEC4CB] dark:border-[#253146] text-[#111318] dark:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <MapPinned size={17} /> {tracking ? "Pause live location tracking" : "Enable live location tracking"}
                </button>
                <p role="status" aria-live="polite" className="text-xs text-[#6B7280] dark:text-[#94A3B8]">{locationStatus}</p>
                {currentLocation && <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Last GPS fix: {new Date(currentLocation.timestamp).toLocaleTimeString()} · {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}</p>}
                <div className="flex gap-2">
                  <select
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(Number(e.target.value))}
                    className="min-w-0 flex-1 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] text-[#111318] dark:text-[#F1F5F9] px-3 py-2 text-xs font-medium"
                  >
                    <option value={15}>Extend ETA by 15 min</option>
                    <option value={30}>Extend ETA by 30 min</option>
                    <option value={60}>Extend ETA by 60 min</option>
                    <option value={120}>Extend ETA by 120 min</option>
                  </select>
                  <button
                    type="button"
                    onClick={extendEta}
                    disabled={journeyLoading}
                    className="rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Extend ETA
                  </button>
                </div>
                {activeJourney?.eta && <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Expected arrival: {new Date(activeJourney.eta).toLocaleString()}</p>}
              </div>
            )}

            {journeyStatus === "active" && (
              <button
                type="button"
                onClick={completeJourney}
                disabled={journeyLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#0D9488]/20 disabled:opacity-60 transition cursor-pointer"
              >
                {journeyLoading ? (
                  <RefreshCw className="animate-spin" size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                Complete journey
              </button>
            )}

            {journeyStatus === "completed" && (
              <button
                type="button"
                onClick={resetJourney}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] px-4 py-3 text-sm font-bold text-[#111318] dark:text-[#F1F5F9] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <RotateCcw size={16} />
                Plan another journey
              </button>
            )}

            <div className="mt-4 border-t border-[#E8D7DC] dark:border-[#253146] pt-4">
              <button
                type="button"
                onClick={handleSOS}
                disabled={journeyLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-red-600/30 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <Phone size={18} />
                Send SOS email
              </button>

              <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#6B7280] dark:text-[#94A3B8]">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-amber-600"
                  size={14}
                />
                Sends an emergency email to your consented trusted contacts. Provider acceptance does not guarantee inbox delivery.
              </p>
            </div>
          </section>

          {feedbackContext && journeyStatus !== "active" && (
            <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-xs">
              <div className="mb-2 flex items-center gap-2">
                <Star className="text-amber-500" size={18} />
                <h3 className="font-serif-editorial text-lg font-bold text-[#111318] dark:text-[#F1F5F9]">Journey feedback</h3>
              </div>
              <p className="mb-4 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Your journey is complete: {feedbackContext.originLabel} → {feedbackContext.destinationLabel}.
              </p>
              <form onSubmit={submitRouteFeedback} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]">Your rating</label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] text-[#111318] dark:text-[#F1F5F9] px-3.5 py-2.5 text-xs font-medium"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Very poor</option>
                </select>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Share helpful details about this completed journey (optional)"
                  className="w-full rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] text-[#111318] dark:text-[#F1F5F9] p-3 text-xs"
                />
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full rounded-2xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#9B123E] dark:hover:bg-[#7E0E32] px-4 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {feedbackLoading ? "Submitting..." : "Submit journey feedback"}
                </button>
              </form>
              <p className="mt-3 text-[11px] leading-4 text-[#6B7280] dark:text-[#94A3B8]">Community feedback is informational and does not guarantee route safety.</p>
              {feedbackItems.length > 0 && (
                <div className="mt-4 space-y-2.5 border-t border-[#E8D7DC] dark:border-[#253146] pt-4">
                  <h4 className="font-serif-editorial text-sm font-bold text-[#111318] dark:text-[#F1F5F9]">Recent community feedback</h4>
                  {feedbackItems.map((item) => (
                    <div key={item._id} className="rounded-2xl bg-[#FFF9F5] dark:bg-[#0B0E14] border border-[#E8D7DC] dark:border-[#253146] p-3">
                      <p className="text-xs font-bold text-[#111318] dark:text-[#F1F5F9]">{item.authorName || "Traveller"} · {item.rating}/5</p>
                      {item.comment && <p className="mt-1 text-xs text-[#4B5563] dark:text-[#94A3B8]">{item.comment}</p>}
                      <p className="mt-1 text-[10px] text-[#6B7280] dark:text-[#64748B]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {feedbackContext && journeyStatus === "active" && (
            <p className="rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-4 text-xs text-[#6B7280] dark:text-[#94A3B8]">Feedback will be available after you complete your current journey.</p>
          )}
        </div>
      </div>
    </div>
  );
}

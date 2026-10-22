
import { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "360px" };
const defaultCenter = { lat: 26.8467, lng: 80.9462 };

export default function LeafletRouteMap({
  originPoint,
  destinationPoint,
  routes = [],
  selectedRoute,
}) {
  const [map, setMap] = useState(null);
  const [googleRoutes, setGoogleRoutes] = useState([]);
  const [mapError, setMapError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "saheli-google-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    let cancelled = false;

    async function calculateRoutes() {
      setGoogleRoutes([]);
      setMapError("");

      if (!isLoaded || !originPoint || !destinationPoint) return;

      const origin = {
        lat: Number(originPoint.lat),
        lng: Number(originPoint.lng),
      };
      const destination = {
        lat: Number(destinationPoint.lat),
        lng: Number(destinationPoint.lng),
      };

      if (
        !Number.isFinite(origin.lat) ||
        !Number.isFinite(origin.lng) ||
        !Number.isFinite(destination.lat) ||
        !Number.isFinite(destination.lng)
      ) {
        setMapError("Invalid starting point or destination coordinates.");
        return;
      }

      setLoading(true);

      try {
        const { Route } =
          await window.google.maps.importLibrary("routes");

        const result = await Route.computeRoutes({
          origin,
          destination,
          travelMode: "DRIVING",
          computeAlternativeRoutes: true,
          fields: ["path", "viewport", "distanceMeters", "duration"],
        });

        if (cancelled) return;

        const availableRoutes = (result.routes || []).filter(
          (route) => route.path?.length > 1
        );

        if (!availableRoutes.length) {
          setMapError("Google did not return any road routes.");
          return;
        }

        setGoogleRoutes(availableRoutes);

        if (availableRoutes[0].viewport && map) {
          map.fitBounds(availableRoutes[0].viewport);
        } else if (map) {
          map.fitBounds(
            new window.google.maps.LatLngBounds(origin, destination)
          );
        }
      } catch (error) {
        console.error("Google alternative routes error:", error);
        if (!cancelled) {
          setMapError(
            error?.message || "Unable to load alternative routes."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    calculateRoutes();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    map,
    originPoint?.lat,
    originPoint?.lng,
    destinationPoint?.lat,
    destinationPoint?.lng,
  ]);

  if (loadError) {
    return <p>Google Maps failed to load. Check your API configuration.</p>;
  }

  if (!isLoaded) {
    return <div className="h-[360px] animate-pulse rounded-xl bg-slate-100" />;
  }

  // Match the selected card's position to Google's returned alternatives.
  const selectedIndex = Math.max(
    0,
    routes.findIndex(
      (route) => route === selectedRoute ||
        (route.routeId && route.routeId === selectedRoute?.routeId)
    )
  );

  const selectedGoogleRoute =
    googleRoutes[selectedIndex] || googleRoutes[0];

  const center = originPoint
    ? { lat: Number(originPoint.lat), lng: Number(originPoint.lng) }
    : defaultCenter;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={setMap}
        onUnmount={() => setMap(null)}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {originPoint && (
          <Marker
            position={{
              lat: Number(originPoint.lat),
              lng: Number(originPoint.lng),
            }}
            label="A"
          />
        )}

        {destinationPoint && (
          <Marker
            position={{
              lat: Number(destinationPoint.lat),
              lng: Number(destinationPoint.lng),
            }}
            label="B"
          />
        )}

        {googleRoutes.map((route, index) => {
          const path = route.path.map((point) => ({
            lat: typeof point.lat === "function" ? point.lat() : point.lat,
            lng: typeof point.lng === "function" ? point.lng() : point.lng,
          }));

          const isSelected = route === selectedGoogleRoute;

          return (
            <Polyline
              key={index}
              path={path}
              options={{
                strokeColor: isSelected ? "#7c3aed" : "#64748b",
                strokeOpacity: isSelected ? 0.95 : 0.5,
                strokeWeight: isSelected ? 6 : 4,
                zIndex: isSelected ? 2 : 1,
              }}
            />
          );
        })}
      </GoogleMap>

      {loading && (
        <p className="bg-violet-50 px-3 py-2 text-sm text-violet-700">
          Finding alternative routes...
        </p>
      )}

      {mapError && (
        <p className="bg-amber-50 p-3 text-sm text-amber-800">
          {mapError}
        </p>
      )}

      {!loading && googleRoutes.length > 1 && (
        <p className="px-3 py-2 text-sm text-slate-600">
          Showing route {Math.min(selectedIndex + 1, googleRoutes.length)} of{" "}
          {googleRoutes.length} Google alternatives.
        </p>
      )}
    </div>
  );
}

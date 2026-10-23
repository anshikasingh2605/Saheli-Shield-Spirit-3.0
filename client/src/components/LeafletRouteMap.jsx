import { useEffect, useMemo, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { decode } from "@googlemaps/polyline-codec";

const containerStyle = { width: "100%", height: "360px" };
const defaultCenter = { lat: 26.8467, lng: 80.9462 };

function getRouteCoordinates(route) {
  if (Array.isArray(route?.coordinates) && route.coordinates.length > 1) {
    return route.coordinates.map((p) => ({ lat: Number(p.lat ?? p[0]), lng: Number(p.lng ?? p[1]) }));
  }
  if (typeof route?.polyline === "string" && route.polyline.length > 0) {
    try {
      return decode(route.polyline).map(([lat, lng]) => ({ lat, lng }));
    } catch (error) {
      console.error("Could not decode backend route polyline", error);
    }
  }
  return [];
}

export default function LeafletRouteMap({ originPoint, destinationPoint, routes = [], selectedRoute, currentLocation }) {
  const [map, setMap] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "saheli-google-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const routePaths = useMemo(() => routes.map((route) => ({ route, path: getRouteCoordinates(route) })), [routes]);
  const selectedPath = useMemo(() => getRouteCoordinates(selectedRoute), [selectedRoute]);
  const hasGeometry = selectedPath.length > 1;

  useEffect(() => {
    if (!map || !originPoint || !destinationPoint) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: Number(originPoint.lat), lng: Number(originPoint.lng) });
    bounds.extend({ lat: Number(destinationPoint.lat), lng: Number(destinationPoint.lng) });
    selectedPath.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 40);
  }, [map, originPoint?.lat, originPoint?.lng, destinationPoint?.lat, destinationPoint?.lng, selectedPath]);

  if (loadError) return <div className="flex h-[360px] items-center justify-center rounded-xl bg-slate-100 p-4 text-center text-sm text-red-600">Google Maps failed to load. Check your browser key, referrer restrictions, and Maps JavaScript API.</div>;
  if (!isLoaded) return <div className="flex h-[360px] items-center justify-center rounded-xl bg-slate-100">Loading Google Maps...</div>;

  const center = originPoint ? { lat: Number(originPoint.lat), lng: Number(originPoint.lng) } : defaultCenter;

  return <div className="overflow-hidden rounded-2xl border border-slate-200">
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8} onLoad={setMap} onUnmount={() => setMap(null)} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}>
      {originPoint && <Marker position={{ lat: Number(originPoint.lat), lng: Number(originPoint.lng) }} label="A" />}
      {destinationPoint && <Marker position={{ lat: Number(destinationPoint.lat), lng: Number(destinationPoint.lng) }} label="B" />}
      {currentLocation && Number.isFinite(Number(currentLocation.lat)) && Number.isFinite(Number(currentLocation.lng)) && (
        <Marker
          position={{ lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) }}
          title={currentLocation.isSimulated ? "Last saved simulated position (not live GPS)" : "Your current GPS location"}
          label="You"
          zIndex={10}
        />
      )}
      {routePaths.map(({ route, path }, index) => {
        const selected = route === selectedRoute || (route?.routeId && route.routeId === selectedRoute?.routeId);
        if (path.length < 2 || selected) return null;
        return <Polyline key={route.routeId || index} path={path} options={{ strokeColor: "#94a3b8", strokeOpacity: 0.45, strokeWeight: 4, zIndex: 1 }} />;
      })}
      {hasGeometry && <Polyline path={selectedPath} options={{ strokeColor: "#7c3aed", strokeOpacity: 0.95, strokeWeight: 6, zIndex: 3 }} />}
    </GoogleMap>
    {selectedRoute && !hasGeometry && <p className="bg-amber-50 p-3 text-sm text-amber-800">The backend did not return road geometry for this route. Its card may be an estimate; the map will not draw a misleading substitute route.</p>}
    {hasGeometry && <p className="bg-violet-50 px-3 py-2 text-sm text-violet-700">Map path matches the selected backend route. This does not verify personal safety.</p>}
    {currentLocation && <p className="bg-slate-50 px-3 py-2 text-xs text-slate-600">{currentLocation.isSimulated ? "Last saved location is simulated; it is not live GPS." : "Current/last GPS position is shown as 'You'."} Accuracy: {Math.round(Number(currentLocation.accuracy) || 0)} m.</p>}
  </div>;
}

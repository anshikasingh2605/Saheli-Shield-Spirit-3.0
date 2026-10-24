
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  relationship: "",
  consentGiven: false,
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function extractContacts(response) {
  const data = response?.data?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.contacts)) return data.contacts;
  if (Array.isArray(data?.data)) return data.data;

  return null;
}

function normalizePhone(phone) {
  return phone.trim().replace(/[\s()-]/g, "");
}

function isValidPhone(phone) {
  return /^\+?[1-9]\d{7,14}$/.test(normalizePhone(phone));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/contacts");
      const savedContacts = extractContacts(response);

      if (!savedContacts) {
        throw new Error(
          "Unexpected contacts response from the server."
        );
      }

      setContacts(savedContacts);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (contact) => {
    setEditingId(contact._id || contact.id);
    setForm({
      name: contact.name || "",
      phone: contact.phone || "",
      email: contact.email || "",
      relationship: contact.relationship || "",
      consentGiven: Boolean(contact.consentGiven),
    });
    setFormError("");
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setError("");
    setNotice("");

    const name = form.name.trim();
    const phone = normalizePhone(form.phone);
    const email = form.email.trim().toLowerCase();
    const relationship = form.relationship.trim();

    if (name.length < 2) {
      setFormError("Enter a name with at least 2 characters.");
      return;
    }

    if (!isValidPhone(phone)) {
      setFormError(
        "Enter a valid phone number with country code, for example +919876543210."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setFormError(
        "Enter a valid email address for emergency SOS alerts."
      );
      return;
    }

    if (!form.consentGiven) {
      setFormError(
        "Please confirm that this person has agreed to receive safety alerts."
      );
      return;
    }

    const payload = {
      name,
      phone,
      email,
      relationship,
      consentGiven: true,
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/contacts/${editingId}`, payload);
      } else {
        await api.post("/contacts", payload);
      }

      setNotice(
        editingId
          ? "Trusted contact updated successfully."
          : "Trusted contact saved successfully."
      );

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadContacts();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contact) => {
    const id = contact._id || contact.id;

    if (!id) {
      setError("This contact has no valid record ID.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${contact.name || "this contact"} from your trusted contacts?`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      await api.delete(`/contacts/${id}`);

      setContacts((previous) =>
        previous.filter((item) => (item._id || item.id) !== id)
      );

      setNotice("Trusted contact removed successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Users size={27} />
          </div>

          <div>
            <p className="text-sm font-medium text-violet-700">
              YOUR SAFETY NETWORK
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Trusted Contacts
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-slate-500">
          Manage the people you trust in an emergency. SaheliShield
          uses their saved email addresses for SOS alerts. Keep their
          phone numbers available for contact purposes and always
          obtain their consent before adding them.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <HeartHandshake size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Your trusted people
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading contacts..."
                  : `${contacts.length} ${
                      contacts.length === 1 ? "contact" : "contacts"
                    } saved`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadContacts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
            >
              <UserPlus size={17} />
              Add contact
=======
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

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
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

              <div className="flex items-center gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#161D2B] px-3.5 focus-within:border-[#7E0E32] dark:focus-within:border-[#FB7185] focus-within:ring-2 focus-within:ring-[#7E0E32]/15">
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
>>>>>>> ashish
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-xl border border-violet-200 bg-violet-50/40 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">
                {editingId ? "Edit trusted contact" : "Add trusted contact"}
              </h3>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-50"
              >
                <X size={19} />
              </button>
=======
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-bold leading-5 text-red-700 dark:text-red-300"
            >
              {error}
>>>>>>> ashish
            </div>

<<<<<<< HEAD
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength={80}
                  autoComplete="name"
                  required
                  placeholder="Enter contact name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  required
                  placeholder="+919876543210"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Include the country code.
=======
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
>>>>>>> ashish
                </p>
              </div>

<<<<<<< HEAD
              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="trustedperson@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
=======
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
>>>>>>> ashish
                />

                <p className="mt-1 text-xs text-slate-500">
                  SOS alerts will be sent to this email address.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="contact-relationship"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Relationship (optional)
                </label>

                <input
                  id="contact-relationship"
                  name="relationship"
                  value={form.relationship}
                  onChange={updateField}
                  maxLength={60}
                  placeholder="e.g. Parent, friend, sibling"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                name="consentGiven"
                checked={form.consentGiven}
                onChange={updateField}
                required
                className="mt-1 h-4 w-4 accent-violet-700"
              />

              <span className="text-sm leading-6 text-slate-700">
                This person has agreed to be my trusted contact and to
                receive safety alerts when needed.
              </span>
            </label>

            {formError && (
              <p role="alert" className="text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <RefreshCw size={16} className="animate-spin" />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Save contact"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="py-10 text-center text-slate-500">
              <RefreshCw
                size={25}
                className="mx-auto animate-spin"
              />
              <p className="mt-3 text-sm">
                Loading your saved contacts...
              </p>
            </div>
          )}

<<<<<<< HEAD
          {!loading && !error && contacts.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
              <Users size={32} className="mx-auto text-slate-400" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No trusted contacts yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add someone you trust to receive your email SOS alerts.
              </p>
            </div>
          )}

          {!loading &&
            contacts.map((contact) => {
              const id = contact._id || contact.id;
              const hasConsent = Boolean(contact.consentGiven);

              return (
                <article
                  key={id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="rounded-full bg-violet-100 p-3 text-violet-700">
                      <Users size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-semibold text-slate-900">
                          {contact.name || "Unnamed contact"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            hasConsent
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {hasConsent
                            ? "Consent recorded"
                            : "Consent not recorded"}
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-2 break-all text-sm text-slate-600">
                        <Phone size={15} className="shrink-0" />
                        {contact.phone || "No phone number"}
                      </p>

                      <p className="mt-2 flex items-center gap-2 break-all text-sm text-slate-600">
                        <Mail size={15} className="shrink-0" />
                        {contact.email || "No email address saved"}
                      </p>

                      {contact.relationship && (
                        <p className="mt-2 text-sm text-slate-500">
                          Relationship: {contact.relationship}
                        </p>
                      )}

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <ShieldCheck size={14} />
                        Email SOS recipient
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <button
                      type="button"
                      onClick={() => openEditForm(contact)}
                      disabled={Boolean(deletingId)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(contact)}
                      disabled={deletingId === id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === id ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}

                      {deletingId === id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}
=======
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
>>>>>>> ashish
        </div>
      </section>
    </div>
  );
}

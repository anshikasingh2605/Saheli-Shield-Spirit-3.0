
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
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
    error.response?.data?.message ||
    error.message ||
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

function validPhone(phone) {
  return /^\+?[1-9]\d{7,14}$/.test(normalizePhone(phone));
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
        throw new Error("The server returned an unexpected contacts response.");
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
    setForm(EMPTY_FORM);
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
    setForm(EMPTY_FORM);
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

    if (!validPhone(phone)) {
      setFormError(
        "Enter a valid phone number in international format, for example +919876543210."
      );
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address for SOS alerts.");
      return;
    }

    if (!form.consentGiven) {
      setFormError(
        "Confirm that this person has agreed to be your trusted contact before saving."
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
        setNotice("Trusted contact updated successfully.");
      } else {
        await api.post("/contacts", payload);
        setNotice("Trusted contact saved successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
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

      setNotice("Trusted contact removed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
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
          Manage the people you have chosen to contact in an emergency. SOS alerts use their saved email address; keep their phone number for contact details. Always confirm their permission before adding them.
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
            </button>
          </div>
        </div>

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
            </div>

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
                </p>
              </div>

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
                  required
                  placeholder="trustedperson@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
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
                className="mt-1 h-4 w-4 accent-violet-700"
              />
              <span className="text-sm leading-6 text-slate-700">
                This person has agreed to be my trusted contact and to receive
                safety alerts when needed.
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
                {saving && <RefreshCw size={16} className="animate-spin" />}
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
              <RefreshCw size={25} className="mx-auto animate-spin" />
              <p className="mt-3 text-sm">Loading your saved contacts...</p>
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
                        <p className="mt-1 text-sm text-slate-500">
                          {contact.relationship}
                        </p>
                      )}

                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <ShieldCheck size={14} />
                        {hasConsent
                          ? "Eligible for SOS notification, subject to backend rules and delivery configuration."
                          : "Not eligible for SOS notification when consent is required."}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openEditForm(contact)}
                      disabled={deletingId === id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(contact)}
                      disabled={deletingId === id}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === id ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}

          {!loading && contacts.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <Users size={30} className="mx-auto text-slate-400" />
              <h3 className="mt-3 font-semibold text-slate-800">
                No trusted contacts yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add someone who has agreed to receive your safety alerts.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
              >
                <UserPlus size={16} />
                Add your first contact
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <ShieldCheck size={19} className="mt-0.5 shrink-0" />
        <p>
          <strong>Safety reminder:</strong> Saving a contact does not guarantee
          SMS delivery. SOS delivery depends on backend processing, valid
          recipient numbers, provider configuration, and network availability.
          Never rely on this prototype as your only emergency channel.
        </p>
      </div>
    </div>
  );
}

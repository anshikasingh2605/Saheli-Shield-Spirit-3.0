
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

    // Backend PATCH /contacts/:id does not support updating email —
    // email is set once on creation and cannot be changed.
    const payload = editingId
      ? { name, phone, relationship, consentGiven: true }
      : { name, phone, email, relationship, consentGiven: true };

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
    <div className="mx-auto max-w-5xl space-y-6 font-sans-ui">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185] shadow-2xs shrink-0">
            <Users size={25} />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E0E32] dark:text-[#FB7185]">
              YOUR SAFETY NETWORK
            </p>
            <h1 className="font-serif-editorial text-3xl font-bold text-[#111318] dark:text-[#F8FAFC] sm:text-4xl">
              Trusted Contacts
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-[#94A3B8]">
          Manage the people you have chosen to contact in an emergency. SOS alerts use their saved email address; keep their phone number for contact details. Always confirm their permission before adding them.
        </p>
      </section>

      <section className="rounded-3xl border border-[#E8D7DC] dark:border-[#253146] bg-white dark:bg-[#161D2B] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF]">
              <HeartHandshake size={20} />
            </div>

            <div>
              <h2 className="font-bold text-[#111318] dark:text-[#F8FAFC]">
                Your trusted people
              </h2>
              <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                {loading
                  ? "Loading contacts..."
                  : `${contacts.length} ${
                      contacts.length === 1 ? "contact" : "contacts"
                    } saved`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={loadContacts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2 text-xs font-semibold text-[#111318] dark:text-[#F8FAFC] hover:bg-[#FFF4EC] dark:hover:bg-[#253146] disabled:opacity-50 transition"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#FB7185] dark:text-[#0B0E14] dark:hover:bg-[#F43F5E] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <UserPlus size={15} />
              Add contact
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs font-medium text-red-800 dark:text-red-300"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#111622] p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#111318] dark:text-[#F8FAFC]">
                {editingId ? "Edit trusted contact" : "Add trusted contact"}
              </h3>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-1.5 text-[#6B7280] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#1E293B] disabled:opacity-50 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8]"
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
                  className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-sm text-[#111318] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#7E0E32] dark:focus:border-[#FB7185] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8]"
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
                  className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-sm text-[#111318] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#7E0E32] dark:focus:border-[#FB7185] focus:outline-none transition-colors"
                />
                <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                  Include the country code.
                </p>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8]"
                >
                  Email address
                  {editingId && (
                    <span className="ml-2 text-xs font-normal text-amber-600">(cannot be changed)</span>
                  )}
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  maxLength={254}
                  required={!editingId}
                  disabled={Boolean(editingId)}
                  placeholder="trustedperson@example.com"
                  className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-sm text-[#111318] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#7E0E32] dark:focus:border-[#FB7185] focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                  {editingId
                    ? "Email is fixed after the contact is created and is used for SOS alerts."
                    : "SOS alerts will be sent to this email address."}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="contact-relationship"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8]"
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
                  className="w-full rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-sm text-[#111318] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#7E0E32] dark:focus:border-[#FB7185] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] p-3 cursor-pointer">
              <input
                type="checkbox"
                name="consentGiven"
                checked={form.consentGiven}
                onChange={updateField}
                required
                className="mt-0.5 h-4 w-4 rounded accent-[#7E0E32] dark:accent-[#FB7185]"
              />
              <span className="text-xs leading-5 text-[#6B7280] dark:text-[#94A3B8]">
                This person has agreed to be my trusted contact and to receive
                safety alerts when needed.
              </span>
            </label>

            {formError && (
              <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#FB7185] dark:text-[#0B0E14] dark:hover:bg-[#F43F5E] px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {saving && <RefreshCw size={14} className="animate-spin" />}
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
                className="rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-4 py-2.5 text-xs font-semibold text-[#111318] dark:text-[#CBD5E1] hover:bg-[#FFF4EC] dark:hover:bg-[#253146] disabled:opacity-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="py-10 text-center text-[#6B7280] dark:text-[#94A3B8]">
              <RefreshCw size={24} className="mx-auto animate-spin text-[#7E0E32] dark:text-[#FB7185]" />
              <p className="mt-3 text-xs">Loading your saved contacts...</p>
            </div>
          )}

          {!loading &&
            contacts.map((contact) => {
              const id = contact._id || contact.id;
              const hasConsent = Boolean(contact.consentGiven);

              return (
                <article
                  key={id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFFDFB] dark:bg-[#1A2233] p-4 sm:p-5 transition hover:border-[#7E0E32]/30 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                      <Users size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-bold text-[#111318] dark:text-[#F8FAFC]">
                          {contact.name || "Unnamed contact"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            hasConsent
                              ? "bg-[#0D9488]/10 text-[#0D9488] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF]"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {hasConsent
                            ? "Consent recorded"
                            : "Consent not recorded"}
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-2 break-all text-xs text-[#6B7280] dark:text-[#94A3B8]">
                        <Phone size={13} className="shrink-0 text-[#7E0E32] dark:text-[#FB7185]" />
                        {contact.phone || "No phone number"}
                      </p>

                      <p className="mt-1.5 flex items-center gap-2 break-all text-xs text-[#6B7280] dark:text-[#94A3B8]">
                        <Mail size={13} className="shrink-0 text-[#7E0E32] dark:text-[#FB7185]" />
                        {contact.email || "No email address saved"}
                      </p>

                      {contact.relationship && (
                        <p className="mt-1 text-xs font-medium text-[#7E0E32] dark:text-[#FB7185]">
                          Relationship: {contact.relationship}
                        </p>
                      )}

                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                        <ShieldCheck size={13} className="text-[#0D9488] dark:text-[#2DD4BF] shrink-0" />
                        {hasConsent
                          ? "Email SOS recipient · Eligible for emergency alerts"
                          : "Not eligible for SOS notification when consent is required."}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openEditForm(contact)}
                      disabled={Boolean(deletingId)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#DEC4CB] dark:border-[#253146] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-[#111318] dark:text-[#CBD5E1] hover:bg-[#FFF4EC] dark:hover:bg-[#253146] disabled:opacity-50 transition"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(contact)}
                      disabled={deletingId === id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-950/40 disabled:opacity-50 transition"
                    >
                      {deletingId === id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      {deletingId === id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}

          {!loading && contacts.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5]/50 dark:bg-[#111622]/50 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7E0E32]/10 dark:bg-[#FB7185]/15 text-[#7E0E32] dark:text-[#FB7185]">
                <Users size={24} />
              </div>
              <h3 className="mt-3.5 font-bold text-[#111318] dark:text-[#F8FAFC]">
                No trusted contacts yet
              </h3>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Add someone who has agreed to receive your safety alerts.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7E0E32] hover:bg-[#5D0A24] dark:bg-[#FB7185] dark:text-[#0B0E14] dark:hover:bg-[#F43F5E] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                <UserPlus size={15} />
                Add your first contact
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[#DEC4CB] dark:border-[#253146] bg-[#FFF9F5] dark:bg-[#111622] p-4 text-xs leading-relaxed text-[#6B7280] dark:text-[#94A3B8]">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#0D9488] dark:text-[#2DD4BF]" />
        <p>
          <strong className="text-[#111318] dark:text-[#F8FAFC]">Safety reminder:</strong> Saving a contact does not guarantee
          SMS delivery. SOS delivery depends on backend processing, valid
          recipient numbers, provider configuration, and network availability.
          Never rely on this prototype as your only emergency channel.
        </p>
      </div>
    </div>
  );
}

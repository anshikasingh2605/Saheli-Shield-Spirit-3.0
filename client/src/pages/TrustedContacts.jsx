
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  Trash2,
  ShieldCheck,
  Info,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

export default function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Family/Friend");
  const [consentGiven, setConsentGiven] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load the logged-in user's contacts from the backend.
  async function loadContacts() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/contacts");
      const result = response.data?.data;

      if (!Array.isArray(result)) {
        throw new Error(
          "The server returned an unexpected contacts response."
        );
      }

      setContacts(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load trusted contacts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  // Add a new contact to MongoDB through the backend.
  async function addContact(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[\s()-]/g, "").trim();

    if (cleanName.length < 2) {
      setError("Contact name must contain at least 2 characters.");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError(
        "Enter a valid phone number with 10–15 digits. You can include a leading +."
      );
      return;
    }

    if (!consentGiven) {
      setError(
        "Please confirm that the contact has agreed to be added to your safety network."
      );
      return;
    }

    if (contacts.length >= 5) {
      setError("You can add a maximum of five trusted contacts.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/contacts", {
        name: cleanName,
        phone: cleanPhone,
        relationship,
        consentGiven: true,
      });

      const createdContact = response.data?.data;

      if (!createdContact?._id && !createdContact?.id) {
        // Reload from the server if the create response shape differs.
        await loadContacts();
      } else {
        setContacts((current) => [
          createdContact,
          ...current.filter(
            (contact) =>
              (contact._id || contact.id) !==
              (createdContact._id || createdContact.id)
          ),
        ]);
      }

      setName("");
      setPhone("");
      setRelationship("Family/Friend");
      setConsentGiven(false);
      setNotice(
        response.data?.message || "Trusted contact added successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.join?.(" ") ||
          "Unable to add this contact. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete the selected contact from the backend.
  async function removeContact(contact) {
    const contactId = contact._id || contact.id;

    if (!contactId) {
      setError("This contact has no valid ID and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${contact.name} from your trusted contacts?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(contactId);

    try {
      const response = await api.delete(`/contacts/${contactId}`);

      setContacts((current) =>
        current.filter(
          (item) => (item._id || item.id) !== contactId
        )
      );

      setNotice(
        response.data?.message || "Trusted contact removed successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove this contact. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Users size={27} />
          </div>

          <div>
            <p className="text-sm font-medium text-violet-700">
              YOUR SAFETY NETWORK
            </p>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Trusted Contacts
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Manage the people you trust for your safety network.
          Your contacts are loaded from your authenticated account.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <UserPlus className="text-violet-700" size={21} />
          <h3 className="font-semibold text-slate-900">
            Add a contact
          </h3>
        </div>

        <form onSubmit={addContact} className="space-y-4">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contact name
            </label>

            <input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter a trusted person's name"
              maxLength={100}
              required
              disabled={saving || contacts.length >= 5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="contact-phone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Phone number
            </label>

            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+919876543210"
              maxLength={20}
              required
              disabled={saving || contacts.length >= 5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
            />

            <p className="mt-1 text-xs text-slate-500">
              Use 10–15 digits, optionally with a leading country-code +.
            </p>
          </div>

          <div>
            <label
              htmlFor="contact-relationship"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Relationship
            </label>

            <select
              id="contact-relationship"
              value={relationship}
              onChange={(event) =>
                setRelationship(event.target.value)
              }
              disabled={saving || contacts.length >= 5}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
            >
              <option value="Family/Friend">Family / Friend</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Partner">Partner</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(event) =>
                setConsentGiven(event.target.checked)
              }
              disabled={saving || contacts.length >= 5}
              className="mt-1 h-4 w-4 accent-violet-700"
            />

            <span>
              I confirm that this person has agreed to be added
              as a trusted contact.
            </span>
          </label>

          <button
            type="submit"
            disabled={saving || contacts.length >= 5}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}

            {saving ? "Saving contact..." : "Add trusted contact"}
          </button>

          {contacts.length >= 5 && (
            <p className="text-sm text-amber-700">
              You have reached the maximum of five trusted contacts.
            </p>
          )}
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
          >
            {notice}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              Your trusted people
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {contacts.length} of 5 contacts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadContacts}
              disabled={loading}
              aria-label="Refresh contacts"
              title="Refresh contacts"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            <ShieldCheck className="text-emerald-700" size={25} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 px-5 py-10 text-slate-500">
            <LoaderCircle size={22} className="animate-spin" />
            Loading your contacts...
          </div>
        ) : error && contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-red-200 px-5 py-8 text-center">
            <p className="font-medium text-red-700">
              Could not load contacts
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Check your connection and try refreshing.
            </p>

            <button
              type="button"
              onClick={loadContacts}
              className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Try again
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
            <Users className="mx-auto text-slate-400" size={30} />

            <p className="mt-3 font-medium text-slate-700">
              No contacts added yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add a trusted person using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => {
              const contactId = contact._id || contact.id;

              return (
                <div
                  key={contactId}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <div className="rounded-full bg-violet-100 p-3 text-violet-700">
                    <Users size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {contact.name}
                    </p>

                    <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                      <Phone size={14} className="shrink-0" />
                      {contact.phone}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {contact.relationship || "Family/Friend"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeContact(contact)}
                    disabled={deletingId === contactId}
                    aria-label={`Remove ${contact.name}`}
                    title="Remove contact"
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === contactId ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-700" size={19} />

        <p className="text-sm leading-6 text-amber-900">
          Contacts are saved to your account through the backend.
          Adding a contact does not itself send an SMS or SOS alert;
          emergency notification delivery must be configured and tested separately.
        </p>
      </div>
    </div>
  );
}

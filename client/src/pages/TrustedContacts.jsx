import { useEffect, useState } from "react";
import { Users, UserPlus, Phone, Trash2, ShieldCheck, Info, LoaderCircle, RefreshCw, Pencil, X, Save } from "lucide-react";
import api from "../services/api";

const emptyForm = { name: "", phone: "", relationship: "Family/Friend", consentGiven: false };
const cleanPhone = (value) => value.replace(/[\s()-]/g, "").trim();
const getError = (err) => err.response?.data?.message || err.response?.data?.errors?.join?.(" ") || err.message || "Request failed. Please try again.";

export default function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadContacts() {
    setLoading(true); setError("");
    try {
      const response = await api.get("/contacts");
      const data = response.data?.data;
      if (!Array.isArray(data)) throw new Error("The backend returned an unexpected contacts response.");
      setContacts(data);
    } catch (err) { setError(getError(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadContacts(); }, []);

  function startEdit(contact) {
    setEditingId(contact._id || contact.id);
    setForm({ name: contact.name || "", phone: contact.phone || "", relationship: contact.relationship || "Family/Friend", consentGiven: Boolean(contact.consentGiven) });
    setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() { setEditingId(null); setForm(emptyForm); setError(""); }

  async function saveContact(event) {
    event.preventDefault(); setError(""); setNotice("");
    const name = form.name.trim(); const phone = cleanPhone(form.phone);
    if (name.length < 2) return setError("Contact name must contain at least 2 characters.");
    if (!/^\+?[0-9]{10,15}$/.test(phone)) return setError("Enter a valid phone number with 10–15 digits and optional leading +.");
    if (!form.consentGiven) return setError("Confirm that this person has agreed to be a trusted contact.");
    if (!editingId && contacts.length >= 5) return setError("You can add a maximum of five trusted contacts.");
    setSaving(true);
    try {
      const payload = { name, phone, relationship: form.relationship, consentGiven: true };
      const response = editingId ? await api.patch(`/contacts/${editingId}`, payload) : await api.post("/contacts", payload);
      setNotice(response.data?.message || (editingId ? "Contact updated." : "Contact saved to your account."));
      setForm(emptyForm); setEditingId(null);
      await loadContacts();
    } catch (err) { setError(getError(err)); }
    finally { setSaving(false); }
  }

  async function removeContact(contact) {
    const id = contact._id || contact.id;
    if (!id) return setError("This contact has no valid ID.");
    if (!window.confirm(`Remove ${contact.name} from your trusted contacts?`)) return;
    setDeletingId(id); setError(""); setNotice("");
    try {
      const response = await api.delete(`/contacts/${id}`);
      setNotice(response.data?.message || "Contact deleted from your account.");
      if (editingId === id) cancelEdit();
      await loadContacts();
    } catch (err) { setError(getError(err)); }
    finally { setDeletingId(null); }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50";
  return <div className="mx-auto max-w-4xl space-y-6">
    <section>
      <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-100 p-3 text-violet-700"><Users size={27}/></div><div><p className="text-sm font-medium text-violet-700">YOUR SAFETY NETWORK</p><h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Trusted Contacts</h2></div></div>
      <p className="mt-4 max-w-2xl leading-7 text-slate-500">Contacts are stored against your authenticated account in MongoDB through the backend. Only contacts who have consented are eligible for SOS SMS.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">{editingId ? <Pencil className="text-violet-700" size={21}/> : <UserPlus className="text-violet-700" size={21}/>}<h3 className="font-semibold text-slate-900">{editingId ? "Edit trusted contact" : "Add a contact"}</h3></div>
      <form onSubmit={saveContact} className="space-y-4">
        <div><label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-700">Contact name</label><input id="contact-name" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} maxLength={100} required disabled={saving} placeholder="Enter a trusted person's name" className={inputClass}/></div>
        <div><label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-slate-700">Phone number</label><input id="contact-phone" type="tel" value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} maxLength={20} required disabled={saving} placeholder="+919876543210" className={inputClass}/><p className="mt-1 text-xs text-slate-500">Use an international country code for SMS, e.g. +91.</p></div>
        <div><label htmlFor="contact-relationship" className="mb-2 block text-sm font-medium text-slate-700">Relationship</label><select id="contact-relationship" value={form.relationship} onChange={e=>setForm(v=>({...v,relationship:e.target.value}))} disabled={saving} className={inputClass}><option>Family/Friend</option><option>Parent</option><option>Sibling</option><option>Partner</option><option>Guardian</option><option>Other</option></select></div>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={form.consentGiven} onChange={e=>setForm(v=>({...v,consentGiven:e.target.checked}))} disabled={saving} className="mt-1 h-4 w-4 accent-violet-700"/><span>I confirm this person has agreed to be a trusted contact and may receive emergency messages.</span></label>
        <div className="flex flex-wrap gap-2"><button type="submit" disabled={saving || (!editingId && contacts.length>=5)} className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-60">{saving?<LoaderCircle size={18} className="animate-spin"/>:editingId?<Save size={18}/>:<UserPlus size={18}/>} {saving?"Saving...":editingId?"Save changes":"Add trusted contact"}</button>{editingId && <button type="button" onClick={cancelEdit} disabled={saving} className="flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold text-slate-700"><X size={18}/> Cancel</button>}</div>
        {!editingId && contacts.length>=5 && <p className="text-sm text-amber-700">You have reached the maximum of five trusted contacts.</p>}
      </form>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}{notice && <p role="status" className="mt-4 whitespace-pre-line rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">{notice}</p>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900">Your trusted people</h3><p className="mt-1 text-sm text-slate-500">{contacts.length} of 5 contacts</p></div><button type="button" onClick={loadContacts} disabled={loading} aria-label="Refresh contacts" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><RefreshCw size={18} className={loading?"animate-spin":""}/></button></div>
      {loading ? <div className="flex items-center justify-center gap-3 rounded-xl border px-5 py-10 text-slate-500"><LoaderCircle size={22} className="animate-spin"/>Loading contacts from backend...</div> : contacts.length===0 ? <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center"><Users className="mx-auto text-slate-400" size={30}/><p className="mt-3 font-medium text-slate-700">No contacts added yet</p><p className="mt-1 text-sm text-slate-500">Add a trusted person using the form above.</p></div> : <div className="space-y-3">{contacts.map(contact=>{const id=contact._id||contact.id;return <div key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><div className="rounded-full bg-violet-100 p-3 text-violet-700"><Users size={20}/></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{contact.name}</p><p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500"><Phone size={14} className="shrink-0"/>{contact.phone}</p><p className="mt-1 text-xs text-slate-500">{contact.relationship||"Family/Friend"} · Consent: {contact.consentGiven?"Granted":"Not granted"}</p></div><button type="button" onClick={()=>startEdit(contact)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-50" aria-label={`Edit ${contact.name}`} title="Edit contact"><Pencil size={18}/></button><button type="button" onClick={()=>removeContact(contact)} disabled={deletingId===id} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label={`Remove ${contact.name}`} title="Remove contact">{deletingId===id?<LoaderCircle size={18} className="animate-spin"/>:<Trash2 size={18}/>}</button></div>})}</div>}
    </section>
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><Info className="mt-0.5 shrink-0 text-amber-700" size={19}/><p className="text-sm leading-6 text-amber-900">SOS delivery depends on backend Twilio configuration and the SMS provider. A successful API request does not guarantee the recipient received the SMS. Test with consenting contacts only.</p></div>
  </div>;
}

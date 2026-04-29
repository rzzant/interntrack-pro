"use client";

import { useState, useEffect } from "react";
import {
  X, Building2, Briefcase, Calendar, MapPin,
  DollarSign, Link, FileText, Save, Trash2,
  ExternalLink, AlertCircle, Clock,
} from "lucide-react";
import { applicationsAPI } from "../../lib/api";
import { useUIStore } from "../../lib/store";
import { formatDate, STATUS_COLORS, daysSince, stringToColor, getInitials } from "@/lib/utils";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"] as const;

const defaultForm = {
  companyName: "",
  role: "",
  status: "Applied" as const,
  dateApplied: new Date().toISOString().split("T")[0],
  notes: "",
  location: "",
  salary: "",
  jobUrl: "",
};

export default function ApplicationModal() {
  const { isModalOpen, closeModal, selectedApplication, modalMode } = useUIStore();
  const [mode, setMode] = useState<"view" | "edit" | "create">(modalMode);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(modalMode);
    if (selectedApplication && modalMode !== "create") {
      setForm({
        companyName: selectedApplication.companyName,
        role: selectedApplication.role,
        status: selectedApplication.status,
        dateApplied: new Date(selectedApplication.dateApplied).toISOString().split("T")[0],
        notes: selectedApplication.notes || "",
        location: selectedApplication.location || "",
        salary: selectedApplication.salary || "",
        jobUrl: selectedApplication.jobUrl || "",
      });
    } else {
      setForm(defaultForm);
    }
    setError("");
  }, [selectedApplication, modalMode, isModalOpen]);

  if (!isModalOpen) return null;

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const app = selectedApplication;

  const colors = app ? STATUS_COLORS[app.status] : STATUS_COLORS["Applied"];
  const logoColor = app ? stringToColor(app.companyName) : "#3b82f6";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.role.trim()) {
      setError("Company name and role are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isCreate) {
        await applicationsAPI.create(form);
      } else if (isEdit && app) {
        await applicationsAPI.update(app._id, form);
      }
      // Trigger list refresh
      window.dispatchEvent(new Event("app:refresh"));
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!app) return;
    if (!confirm(`Delete application to ${app.companyName}?`)) return;
    setLoading(true);
    try {
      await applicationsAPI.delete(app._id);
      window.dispatchEvent(new Event("app:refresh"));
      closeModal();
    } catch {
      setError("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={closeModal}>
      <div
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isView && app ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${logoColor}20`, color: logoColor }}
                >
                  {getInitials(app.companyName)}
                </div>
                <div>
                  <h2 className="font-display font-bold text-white">{app.companyName}</h2>
                  <p className="text-xs text-white/40">{app.role}</p>
                </div>
              </>
            ) : (
              <h2 className="font-display font-bold text-white">
                {isCreate ? "New Application" : `Edit – ${app?.companyName}`}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isView && app && (
              <>
                <button
                  onClick={() => setMode("edit")}
                  className="btn-secondary text-sm py-1.5 px-3 text-xs"
                >
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-danger text-xs py-1.5 px-3">
                  <Trash2 size={13} />
                </button>
              </>
            )}
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* View mode */}
        {isView && app ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status + follow-up */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                {app.status}
              </span>
              {app.needsFollowUp && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  <AlertCircle size={12} />
                  Follow-up recommended (7+ days)
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-white/30 ml-auto">
                <Clock size={12} />
                Applied {daysSince(app.dateApplied)} days ago
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Company", value: app.companyName, icon: Building2 },
                { label: "Role", value: app.role, icon: Briefcase },
                { label: "Date Applied", value: formatDate(app.dateApplied), icon: Calendar },
                { label: "Location", value: app.location || "—", icon: MapPin },
                { label: "Salary", value: app.salary || "—", icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/3 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={13} className="text-white/30" />
                    <span className="text-xs text-white/40">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-white/80">{value}</span>
                </div>
              ))}

              {app.jobUrl && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Link size={13} className="text-white/30" />
                    <span className="text-xs text-white/40">Job URL</span>
                  </div>
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open link <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Notes */}
            {app.notes && (
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={13} className="text-white/30" />
                  <span className="text-xs text-white/40">Notes</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{app.notes}</p>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-white/20 text-right">
              Added {formatDate(app.createdAt)} · Last updated {formatDate(app.updatedAt)}
            </div>
          </div>
        ) : (
          /* Create / Edit form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                  <Building2 size={11} /> Company Name *
                </label>
                <input
                  className="input-dark"
                  placeholder="Google, Meta, Stripe..."
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                  <Briefcase size={11} /> Role *
                </label>
                <input
                  className="input-dark"
                  placeholder="Software Engineer Intern..."
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => {
                    const c = STATUS_COLORS[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          form.status === s
                            ? `${c.bg} ${c.text} ${c.border}`
                            : "bg-white/3 text-white/40 border-white/10 hover:bg-white/8"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                  <Calendar size={11} /> Date Applied
                </label>
                <input
                  type="date"
                  className="input-dark"
                  value={form.dateApplied}
                  onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                  <MapPin size={11} /> Location
                </label>
                <input
                  className="input-dark"
                  placeholder="Remote, NYC, SF..."
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                  <DollarSign size={11} /> Salary/Stipend
                </label>
                <input
                  className="input-dark"
                  placeholder="$25/hr, $3000/month..."
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                <Link size={11} /> Job URL
              </label>
              <input
                type="url"
                className="input-dark"
                placeholder="https://jobs.company.com/..."
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 flex items-center gap-1.5">
                <FileText size={11} /> Notes
              </label>
              <textarea
                className="input-dark resize-none"
                rows={4}
                placeholder="Interview notes, contacts, follow-up details..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={15} />
                    {isCreate ? "Save Application" : "Update Application"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

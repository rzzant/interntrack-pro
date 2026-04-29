"use client";

import { useState, useEffect } from "react";
import {
  X,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Link,
  FileText,
  Save,
  Trash2,
  ExternalLink,
  AlertCircle,
  Clock,
} from "lucide-react";
import { applicationsAPI } from "../../lib/api";
import { useUIStore } from "../../lib/store";
import {
  formatDate,
  STATUS_COLORS,
  daysSince,
  stringToColor,
  getInitials,
} from "@/lib/utils";

// ✅ FIXED TYPE
type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

const STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

// ✅ FIXED FORM TYPE (VERY IMPORTANT)
type FormType = {
  companyName: string;
  role: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes: string;
  location: string;
  salary: string;
  jobUrl: string;
};

const defaultForm: FormType = {
  companyName: "",
  role: "",
  status: "Applied",
  dateApplied: new Date().toISOString().split("T")[0],
  notes: "",
  location: "",
  salary: "",
  jobUrl: "",
};

export default function ApplicationModal() {
  const { isModalOpen, closeModal, selectedApplication, modalMode } =
    useUIStore();

  const [mode, setMode] = useState<"view" | "edit" | "create">(modalMode);
  const [form, setForm] = useState<FormType>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(modalMode);

    if (selectedApplication && modalMode !== "create") {
      setForm({
        companyName: selectedApplication.companyName,
        role: selectedApplication.role,
        status: selectedApplication.status as ApplicationStatus, // ✅ FIX
        dateApplied: new Date(selectedApplication.dateApplied)
          .toISOString()
          .split("T")[0],
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

  const colors = app
    ? STATUS_COLORS[app.status]
    : STATUS_COLORS["Applied"];
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={closeModal}
    >
      <div
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isView && app ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{
                    background: `${logoColor}20`,
                    color: logoColor,
                  }}
                >
                  {getInitials(app.companyName)}
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {app.companyName}
                  </h2>
                  <p className="text-xs text-white/40">
                    {app.role}
                  </p>
                </div>
              </>
            ) : (
              <h2 className="font-bold text-white">
                {isCreate
                  ? "New Application"
                  : `Edit – ${app?.companyName}`}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isView && app && (
              <>
                <button
                  onClick={() => setMode("edit")}
                  className="btn-secondary text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger text-xs"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
            <button onClick={closeModal}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* FORM */}
        {!isView && (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4"
          >
            <input
              className="input-dark"
              placeholder="Company"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />

            <input
              className="input-dark"
              placeholder="Role"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            />

            {/* STATUS */}
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ApplicationStatus,
                })
              }
              className="input-dark"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button className="btn-primary w-full">
              <Save size={14} />
              Save
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
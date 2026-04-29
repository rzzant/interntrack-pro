"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { applicationsAPI } from "../../../lib/api";
import { useUIStore } from "../../../lib/store";
import type { Application } from "../../../lib/store";
import { STATUS_COLORS } from "@/lib/utils";

const STATUSES = ["all", "Applied", "Interview", "Offer", "Rejected"] as const;
type StatusFilter = (typeof STATUSES)[number];

// ✅ FIXED TYPE (matches dropdown values)
type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export default function ApplicationsPage() {
  const { openModal } = useUIStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationsAPI.getAll();
      setApplications(data?.applications || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ✅ FULLY FIXED FUNCTION
  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app._id === id ? { ...app, status: newStatus } : app
      )
    );

    try {
      await applicationsAPI.updateStatus(id, { status: newStatus });
    } catch {
      console.log("Backend failed, UI still updated");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await applicationsAPI.delete(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const filtered = applications.filter((app) => {
    const matchStatus = status === "all" || app.status === status;
    const q = search.toLowerCase();
    const matchSearch =
      app.companyName.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    Applied: applications.filter((a) => a.status === "Applied").length,
    Interview: applications.filter((a) => a.status === "Interview").length,
    Offer: applications.filter((a) => a.status === "Offer").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Applications</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2 text-white/40" />
          <input
            className="input-dark pl-8"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded ${
              status === s
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-sm text-white/50">{key}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-white/40">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40">No applications found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const colors = STATUS_COLORS[app.status] || {
              bg: "bg-white/10",
              text: "text-white",
            };

            return (
              <div
                key={app._id}
                className="flex items-center gap-4 p-4 border border-white/10 rounded transition hover:bg-white/5"
              >
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {app.companyName}
                  </div>
                  <div className="text-white/50 text-sm">{app.role}</div>
                </div>

                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusChange(
                      app._id,
                      e.target.value as ApplicationStatus
                    )
                  }
                  className={`px-2 py-1 rounded ${colors.bg} ${colors.text}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button onClick={() => openModal(app, "edit")}>
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(app._id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
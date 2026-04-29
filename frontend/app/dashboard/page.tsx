"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Briefcase, Trophy, XCircle, Clock, TrendingUp,
  AlertCircle, Plus, Zap,
} from "lucide-react";
import { statsAPI, applicationsAPI } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../lib/store";
import { formatDate } from "@/lib/utils";
import StatCardSkeleton from "@/components/ui/StatCardSkeleton";

interface Stats {
  total: number; applied: number; interview: number;
  offer: number; rejected: number;
}

interface StatsData {
  stats: Stats;
  chartData: { month: string; applications: number; offers: number; interviews: number }[];
  followUpCount: number;
  successRate: number;
  recentApplications: any[];
}

const PIE_COLORS = {
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#6b7280",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statsAPI.get();
        setData(data);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = data
    ? [
        {
          label: "Total Applications",
          value: data.stats.total,
          icon: Briefcase,
          color: "blue",
          bg: "bg-blue-600/10",
          border: "border-blue-500/20",
          iconColor: "text-blue-400",
        },
        {
          label: "Interviews",
          value: data.stats.interview,
          icon: Clock,
          color: "amber",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          iconColor: "text-amber-400",
        },
        {
          label: "Offers Received",
          value: data.stats.offer,
          icon: Trophy,
          color: "emerald",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          iconColor: "text-emerald-400",
        },
        {
          label: "Rejected",
          value: data.stats.rejected,
          icon: XCircle,
          color: "gray",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          iconColor: "text-gray-400",
        },
      ]
    : [];

  const pieData = data
    ? [
        { name: "Applied", value: data.stats.applied },
        { name: "Interview", value: data.stats.interview },
        { name: "Offer", value: data.stats.offer },
        { name: "Rejected", value: data.stats.rejected },
      ].filter((d) => d.value > 0)
    : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm mb-1">{greeting},</p>
          <h1 className="font-display text-3xl font-bold text-white">
            {firstName} <span className="text-white/20">👋</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {data?.stats.total
              ? `You have ${data.stats.total} application${data.stats.total !== 1 ? "s" : ""} tracked`
              : "Start tracking your applications"}
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus size={16} />
          Add Application
        </button>
      </div>

      {/* Follow-up alert */}
      {data?.followUpCount && data.followUpCount > 0 ? (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 animate-slide-up">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-400" />
          </div>
          <div>
            <div className="font-semibold text-amber-400 text-sm mb-0.5">
              {data.followUpCount} application{data.followUpCount !== 1 ? "s" : ""} need follow-up
            </div>
            <div className="text-white/40 text-xs">
              No updates for 7+ days — time to reach out!
            </div>
          </div>
          <a href="/dashboard/applications?status=Applied" className="ml-auto btn-secondary text-sm py-2 text-amber-400 border-amber-500/20">
            View →
          </a>
        </div>
      ) : null}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, bg, border, iconColor }) => (
              <div key={label} className={`card border ${border} animate-slide-up`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={18} className={iconColor} />
                  </div>
                  {label === "Offers Received" && value > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      🎉
                    </span>
                  )}
                </div>
                <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
      </div>

      {/* Success Rate */}
      {!loading && data && (
        <div className="card border border-white/5 flex items-center gap-6 animate-slide-up">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={22} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-display font-bold text-white">{data.successRate}%</span>
              <span className="text-sm text-white/40">success rate</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000"
                style={{ width: `${data.successRate}%` }}
              />
            </div>
            <p className="text-xs text-white/30 mt-1">Interviews + Offers / Total applications</p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-blue-600/10 border border-blue-500/20">
            <Zap size={12} className="text-blue-400" />
            <span className="text-blue-400 font-medium">
              {data.followUpCount > 0 ? `${data.followUpCount} follow-ups` : "All caught up!"}
            </span>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3 card border border-white/5">
          <h3 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-500" />
            Applications Over Time
          </h3>
          {loading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                <Bar dataKey="interviews" name="Interviews" fill="#f59e0b" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                <Bar dataKey="offers" name="Offers" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-white/20 text-sm">
              No data yet — add your first application!
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 card border border-white/5">
          <h3 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-purple-500" />
            Status Breakdown
          </h3>
          {loading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-white/20 text-sm text-center">
              No applications yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {!loading && data?.recentApplications && data.recentApplications.length > 0 && (
        <div className="card border border-white/5 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              Recent Activity
            </h3>
            <a href="/dashboard/applications" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {data.recentApplications.map((app) => (
              <div key={app._id} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/60">
                  {app.companyName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{app.companyName}</div>
                  <div className="text-xs text-white/30 truncate">{app.role}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full border status-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-white/25">{formatDate(app.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

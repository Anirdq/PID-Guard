import React, { useState, useEffect } from "react";
import { getHistory } from "../api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import "./Dashboard.css";

const STATUS_COLOR = { Safe: "#10B981", Suspicious: "#F59E0B", Injection: "#EF4444" };

function StatCard({ label, value, color, icon }) {
    return (
        <div className="stat-card card">
            <div className="stat-top">
                <span className="stat-icon">{icon}</span>
                <span className="stat-val" style={{ color }}>{value}</span>
            </div>
            <p className="stat-label">{label}</p>
        </div>
    );
}

/* Custom tooltip for recharts */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="ct-label">{label}</p>
            <p className="ct-val" style={{ color: STATUS_COLOR[payload[0]?.payload?.status] }}>
                {payload[0]?.value?.toFixed(1)}% · {payload[0]?.payload?.status}
            </p>
        </div>
    );
}

export default function Dashboard() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = async () => {
        setLoading(true); setError(null);
        try {
            const d = await getHistory(50);
            setHistory(d.detections || []);
        } catch {
            setError("Cannot reach backend. Make sure the API server is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetch(); }, []);

    const stats = {
        total: history.length,
        injections: history.filter((h) => h.status === "Injection").length,
        suspicious: history.filter((h) => h.status === "Suspicious").length,
        safe: history.filter((h) => h.status === "Safe").length,
        avgRisk: history.length
            ? (history.reduce((a, h) => a + h.risk_score, 0) / history.length).toFixed(1)
            : "—",
    };

    const chartData = [...history].reverse().slice(0, 20).map((h) => ({
        name: `#${h.id}`, score: h.risk_score, status: h.status,
    }));

    return (
        <div className="container page db-root">
            {/* Page header */}
            <div className="db-header anim-fadeup">
                <div>
                    <h1 className="db-title">Dashboard</h1>
                    <p className="db-sub">Real-time overview of detected prompts and risk trends</p>
                </div>
                <button className="btn btn-ghost" onClick={fetch} disabled={loading}>
                    {loading ? "Loading…" : "↻ Refresh"}
                </button>
            </div>

            {/* Stats */}
            <div className="db-stats anim-fadeup">
                <StatCard label="Total Scanned" value={stats.total} color="var(--brand)" icon="📂" />
                <StatCard label="Avg Risk Score" value={stats.avgRisk === "—" ? "—" : `${stats.avgRisk}%`} color="#A78BFA" icon="📈" />
                <StatCard label="Injections" value={stats.injections} color="var(--injection)" icon="🚨" />
                <StatCard label="Suspicious" value={stats.suspicious} color="var(--suspicious)" icon="⚠️" />
                <StatCard label="Safe" value={stats.safe} color="var(--safe)" icon="✓" />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="card db-chart anim-fadeup">
                    <p className="section-label">Risk Trend — Last 20 Detections</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                            <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: "var(--text-3)", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-input)" }} />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
                                {chartData.map((e, i) => (
                                    <Cell key={i} fill={STATUS_COLOR[e.status] || "var(--brand)"} fillOpacity={0.85} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* History Table */}
            <div className="card db-table anim-fadeup">
                <p className="section-label">Detection History</p>

                {error && <div className="db-error">{error}</div>}
                {loading && <div className="db-empty"><span className="spinner" style={{ borderTopColor: "var(--brand)" }} /></div>}
                {!loading && !error && history.length === 0 && (
                    <div className="db-empty">
                        <p style={{ fontSize: "2rem" }}>🔍</p>
                        <p style={{ marginTop: "0.5rem", color: "var(--text-3)", fontSize: "0.875rem" }}>
                            No detections yet. Head to the Detector and analyze some prompts.
                        </p>
                    </div>
                )}

                {!loading && history.length > 0 && (
                    <div className="db-scroll">
                        <table className="db-tbl">
                            <thead>
                                <tr>
                                    {["#", "Prompt", "Risk", "Status", "Drift", "Behavior", "Time"].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((r) => (
                                    <tr key={r.id}>
                                        <td className="mono muted small">#{r.id}</td>
                                        <td className="prompt-cell" title={r.prompt}>{r.prompt?.slice(0, 65)}{r.prompt?.length > 65 ? "…" : ""}</td>
                                        <td>
                                            <span className="risk-num" style={{ color: STATUS_COLOR[r.status] }}>
                                                {r.risk_score?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td><span className={`badge badge-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                                        <td className="mono muted small">{r.drift_score?.toFixed(1)}%</td>
                                        <td className="mono muted small">{r.behavior_score?.toFixed(1)}%</td>
                                        <td className="mono muted small">
                                            {r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

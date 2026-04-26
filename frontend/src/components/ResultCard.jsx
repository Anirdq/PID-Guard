import React from "react";
import "./ResultCard.css";

const STATUS_MAP = {
    Safe: { color: "var(--safe)", bg: "var(--safe-bg)", icon: "✓", label: "Safe" },
    Suspicious: { color: "var(--suspicious)", bg: "var(--suspicious-bg)", icon: "⚠", label: "Suspicious" },
    Injection: { color: "var(--injection)", bg: "var(--injection-bg)", icon: "✕", label: "Injection Detected" },
};

const CATEGORY_LABELS = {
    instruction_override: "Instruction Override",
    system_prompt_leak: "System Prompt Leak",
    role_jailbreak: "Role Jailbreak",
    safety_bypass: "Safety Bypass",
    prompt_injection_marker: "Injection Marker",
    data_exfiltration: "Data Exfiltration",
    context_manipulation: "Context Manipulation",
};

/* Animated SVG arc gauge */
function RiskGauge({ score, color }) {
    const R = 52, S = 2 * Math.PI * R;
    const filled = (Math.min(score, 100) / 100) * S;
    return (
        <div className="rg-wrap">
            <svg viewBox="0 0 120 120" className="rg-svg">
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--bg-input)" strokeWidth="9" />
                <circle
                    cx="60" cy="60" r={R} fill="none"
                    stroke={color} strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={`${filled} ${S - filled}`}
                    strokeDashoffset={S / 4}
                    style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 5px ${color}80)` }}
                />
                <text x="60" y="53" textAnchor="middle" fill={color} fontSize="21" fontWeight="800" fontFamily="Inter">
                    {Math.round(score)}
                </text>
                <text x="60" y="69" textAnchor="middle" fill="var(--text-3)" fontSize="8.5" fontFamily="Inter" fontWeight="500" letterSpacing="1">
                    RISK %
                </text>
            </svg>
        </div>
    );
}

/* Score mini bar */
function MiniBar({ label, value, color }) {
    return (
        <div className="mb-row">
            <div className="mb-header">
                <span className="mb-label">{label}</span>
                <span className="mb-val" style={{ color }}>{value.toFixed(1)}%</span>
            </div>
            <div className="mb-track">
                <div className="mb-fill" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    );
}

export default function ResultCard({ result }) {
    if (!result) return null;
    const { risk_score, status, drift_score, behavior_score, explanation, patterns_matched, prompt } = result;
    const info = STATUS_MAP[status] || STATUS_MAP["Safe"];

    return (
        <div className="rc-card card anim-scalein" style={{ borderColor: `${info.color}30`, borderLeftColor: info.color, borderLeftWidth: "3px" }}>
            {/* Header row */}
            <div className="rc-header">
                <div className="rc-title-group">
                    <div className="rc-status-icon" style={{ background: info.bg, color: info.color }}>
                        {info.icon}
                    </div>
                    <div>
                        <h3 className="rc-status-label" style={{ color: info.color }}>{info.label}</h3>
                        <p className="rc-prompt-preview">"{prompt?.slice(0, 90)}{prompt?.length > 90 ? "…" : ""}"</p>
                    </div>
                </div>
                <span className={`badge badge-${status?.toLowerCase()}`}>{status}</span>
            </div>

            <div className="divider" />

            {/* Body */}
            <div className="rc-body">
                {/* Gauge column */}
                <div className="rc-gauge-col">
                    <RiskGauge score={risk_score} color={info.color} />
                    <p className="rc-gauge-label">Overall Risk</p>
                </div>

                {/* Metrics + explanation */}
                <div className="rc-detail-col">
                    <div className="rc-bars">
                        <MiniBar label="Semantic Intent Drift" value={drift_score} color="var(--brand)" />
                        <MiniBar label="Behavioral Pattern Score" value={behavior_score} color={info.color} />
                        <MiniBar label="Final Risk Score" value={risk_score} color={info.color} />
                    </div>

                    <div className="rc-explanation">
                        <p className="rc-exp-label">Explanation</p>
                        <p className="rc-exp-text">{explanation}</p>
                    </div>

                    {patterns_matched?.length > 0 && (
                        <div className="rc-patterns">
                            <p className="rc-exp-label">Attack Signatures</p>
                            <div className="rc-chips">
                                {patterns_matched.map((p) => (
                                    <span key={p} className="rc-chip">{CATEGORY_LABELS[p] || p}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

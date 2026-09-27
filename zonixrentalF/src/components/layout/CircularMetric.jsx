import React from "react";

export default function CircularMetric({ value = 0, label, detail, tone = "emerald", size = "normal" }) {
    const safeValue = Math.min(100, Math.max(0, value));
    const ringColor = tone === "orange" ? "#c96f3d" : tone === "slate" ? "#475569" : "#16805b";
    const trackColor = tone === "orange" ? "#f1d5c3" : tone === "slate" ? "#d8dee6" : "#c9e4d8";
    const dimension = size === "large" ? "h-40 w-40" : "h-32 w-32";
    const centerDimension = size === "large" ? "h-28 w-28" : "h-22 w-22";

    return (
        <div className="flex items-center gap-4">
            <div
                className={`grid shrink-0 place-items-center rounded-full ${dimension}`}
                style={{ background: `conic-gradient(${ringColor} ${safeValue}%, ${trackColor} 0)` }}
                role="img"
                aria-label={`${label}: ${Math.round(safeValue)} percent`}
            >
                <div className={`grid place-content-center rounded-full bg-white text-center ${centerDimension}`}>
                    <strong className="text-2xl font-semibold tabular-nums text-slate-950">{Math.round(safeValue)}%</strong>
                    <span className="text-[11px] text-slate-500">{label}</span>
                </div>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
            </div>
        </div>
    );
}

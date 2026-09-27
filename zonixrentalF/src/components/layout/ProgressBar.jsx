import React from "react";

export default function ProgressBar({ value = 0, label, colorClassName = "bg-emerald-700" }) {
    const safeValue = Math.min(100, Math.max(0, value));

    return (
        <div>
            <div
                className="h-2 overflow-hidden bg-slate-100"
                role="progressbar"
                aria-label={label}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(safeValue)}
            >
                <div className={`h-full transition-[width] ${colorClassName}`} style={{ width: `${safeValue}%` }} />
            </div>
            {label && <span className="mt-1.5 block text-xs text-slate-500">{label}</span>}
        </div>
    );
}

import React from "react";
import { Link } from "react-router-dom";

export default function MetricItem({ icon: Icon, label, value, detail, valueClassName = "text-slate-950", className = "", to }) {
    const content = (
        <>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                {Icon && <span className="grid h-7 w-7 place-items-center border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700"><Icon size={14} aria-hidden="true" /></span>}
                {label}
            </span>
            <strong className={`text-2xl font-semibold tabular-nums ${valueClassName}`}>{value}</strong>
            {detail && <span className="text-xs text-slate-500">{detail}</span>}
        </>
    );
    const itemClassName = `group flex min-h-24 flex-col justify-between py-4 sm:py-2 ${to ? "transition-colors hover:bg-slate-50" : ""} ${className}`;

    return to
        ? <Link to={to} className={itemClassName}>{content}</Link>
        : <article className={itemClassName}>{content}</article>;
}
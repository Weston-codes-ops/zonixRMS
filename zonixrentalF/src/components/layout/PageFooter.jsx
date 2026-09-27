import React from "react";
import { useRentalData } from "../../state/RentalDataContext";

export default function PageFooter() {
    const { connectionStatus } = useRentalData();
    const status = {
        connected: { label: "Backend connected", style: "bg-emerald-700" },
        loading: { label: "Connecting to backend", style: "bg-amber-500" },
        error: { label: "Backend unavailable", style: "bg-rose-600" },
    }[connectionStatus];

    return (
        <footer className="mt-auto flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>Zonix Residential Management · Single-property workspace</span>
            <span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${status.style}`} />{status.label}</span>
        </footer>
    );
}
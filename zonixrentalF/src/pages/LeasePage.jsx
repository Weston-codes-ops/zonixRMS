import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, FileText, Plus, Search, X } from "lucide-react";
import { getLeaseStatus, getUnitLease, useRentalData } from "../state/RentalDataContext";
import SectionHeading from "../components/layout/SectionHeading";
import MetricItem from "../components/layout/MetricItem";

const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function formatDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

export default function LeasePage({ embedded = false }) {
    const { leases, residents, units, createLease, cancelLease, connectionStatus } = useRentalData();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedResidentIds, setSelectedResidentIds] = useState([]);
    const [startDate, setStartDate] = useState(today());
    const [endDate, setEndDate] = useState("");
    const [formError, setFormError] = useState("");
    const [notice, setNotice] = useState("");

    const leaseRows = leases.map((lease) => ({ ...lease, currentStatus: getLeaseStatus(lease) }));
    const activeCount = leaseRows.filter((lease) => lease.currentStatus === "ACTIVE").length;
    const pendingCount = leaseRows.filter((lease) => lease.currentStatus === "PENDING").length;
    const expiringCount = leaseRows.filter((lease) =>
        lease.currentStatus === "ACTIVE"
        && (new Date(`${lease.endDate}T00:00:00`) - new Date(`${today()}T00:00:00`)) / 86400000 <= 30).length;

    const filteredLeases = useMemo(() => {
        const query = search.trim().toLowerCase();
        return leaseRows.filter((lease) => {
            const matchesSearch = [lease.leaseNumber, lease.unitNumber, ...lease.residents.map((resident) => `${resident.firstName} ${resident.surname}`)]
                .some((value) => value.toLowerCase().includes(query));
            return matchesSearch && (statusFilter === "ALL" || lease.currentStatus === statusFilter);
        });
    }, [leases, search, statusFilter]);

    const eligibleUnits = units.filter((unit) => {
        if (!startDate || !endDate) return !getUnitLease(unit.id, leases);
        return !leases.some((lease) => {
            const status = getLeaseStatus(lease);
            return Number(lease.unitId) === Number(unit.id)
                && ["ACTIVE", "PENDING"].includes(status)
                && lease.startDate <= endDate
                && lease.endDate >= startDate;
        });
    });

    const openCreateDialog = () => {
        setFormError("");
        setNotice("");
        setSelectedResidentIds([]);
        setStartDate(today());
        setEndDate("");
        setDialogOpen(true);
    };

    const submitLease = async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        try {
            const lease = await createLease({
                unitId: Number(values.unitId),
                residentIds: selectedResidentIds,
                startDate: values.startDate,
                endDate: values.endDate,
                rent: Number(values.rent),
            });
            setDialogOpen(false);
            setNotice(`${lease.leaseNumber} created for Unit ${lease.unitNumber}.`);
        } catch (error) {
            setFormError(error.message);
        }
    };

    const handleCancel = async (lease) => {
        if (!window.confirm(`Cancel ${lease.leaseNumber}? The unit will become available if no other active lease covers today.`)) return;
        try {
            await cancelLease(lease.id);
            setNotice(`${lease.leaseNumber} cancelled.`);
        } catch (error) {
            setNotice(error.message);
        }
    };

    const toggleResident = (residentId) => {
        setSelectedResidentIds((current) => current.includes(residentId)
            ? current.filter((id) => id !== residentId)
            : [...current, residentId]);
    };

    const statusLabel = (status) => ({ ACTIVE: "Active", PENDING: "Pending", EXPIRED: "Expired", CANCELLED: "Cancelled" })[status] || status;

    return (
        <section className="mx-auto w-full max-w-375 text-slate-900">
            <div className={`border-b border-slate-200 ${embedded ? "pb-5" : "pb-7"}`}>
                {!embedded && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Tenancy management</p>}
                <SectionHeading
                    title={embedded ? "Lease management" : "Leases"}
                    description="Assign residents to units and keep occupancy in step with lease dates."
                >
                    <button type="button" onClick={openCreateDialog} disabled={connectionStatus !== "connected" || !units.length || !residents.length} className="inline-flex shrink-0 items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                        <Plus size={17} aria-hidden="true" /> Create lease
                    </button>
                </SectionHeading>
            </div>

            {notice && <div role="status" className="mt-5 flex items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><span>{notice}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16} /></button></div>}

            <section aria-label="Lease summary" className="grid border-b border-slate-200 py-6 sm:grid-cols-3">
                <MetricItem icon={FileText} label="Active leases" value={activeCount} detail="Currently occupying units" valueClassName="text-emerald-700" className="border-b border-slate-200 sm:border-b-0 sm:border-r sm:pr-5" />
                <MetricItem icon={Clock3} label="Pending start" value={pendingCount} detail="Future-dated agreements" className="border-b border-slate-200 sm:border-b-0 sm:border-r sm:px-5" />
                <MetricItem icon={CalendarDays} label="Ending within 30 days" value={expiringCount} detail="Review for renewal or move-out" valueClassName="text-[#bd6535]" className="sm:pl-5" />
            </section>

            <section aria-labelledby="lease-list-heading" className="pt-7">
                <SectionHeading id="lease-list-heading" icon={CalendarDays} title="Lease register" description="Residents, unit, term, rent, and current status.">
                        <label className="relative block sm:w-64"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search lease, resident, unit" aria-label="Search leases" className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                        <label className="relative"><span className="sr-only">Filter by lease status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 w-full appearance-none border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none focus:border-emerald-700 sm:w-40"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" /></label>
                </SectionHeading>

                {(!units.length || !residents.length) && (
                    <div className="mt-5 grid gap-2 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                        {!units.length && <p>Add units before creating a lease.</p>}
                        {!residents.length && <p>Add residents before assigning a lease.</p>}
                    </div>
                )}

                <div className="mt-5 overflow-x-auto border border-slate-200">
                    <table className="w-full min-w-250 border-collapse text-left">
                        <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500"><th className="px-5 py-3.5">Lease</th><th className="px-5 py-3.5">Residents</th><th className="px-5 py-3.5">Unit</th><th className="px-5 py-3.5">Term</th><th className="px-5 py-3.5">Monthly rent</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5"><span className="sr-only">Actions</span></th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeases.length ? filteredLeases.map((lease) => (
                                <tr key={lease.id} className="hover:bg-slate-50/80">
                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">{lease.leaseNumber}</td>
                                    <td className="max-w-56 px-5 py-4 text-sm text-slate-700">{lease.residents.map((resident) => `${resident.firstName} ${resident.surname}`).join(", ")}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{lease.unitNumber}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(lease.startDate)} – {formatDate(lease.endDate)}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-slate-700">{Number(lease.rent).toLocaleString("en-KE", { style: "currency", currency: "KES" })}</td>
                                    <td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${lease.currentStatus === "ACTIVE" ? "text-emerald-800" : lease.currentStatus === "PENDING" ? "text-[#a75328]" : "text-slate-500"}`}><span className={`h-2 w-2 rounded-full ${lease.currentStatus === "ACTIVE" ? "bg-emerald-600" : lease.currentStatus === "PENDING" ? "bg-[#d77943]" : "bg-slate-300"}`} />{statusLabel(lease.currentStatus)}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-right">{["ACTIVE", "PENDING"].includes(lease.currentStatus) && <button type="button" onClick={() => handleCancel(lease)} className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-rose-700">Cancel lease</button>}</td>
                                </tr>
                            )) : <tr><td colSpan="7" className="px-5 py-14 text-center"><p className="text-sm font-medium text-slate-700">{leases.length ? "No matching leases" : connectionStatus === "loading" ? "Loading leases…" : connectionStatus === "error" ? "Lease data unavailable" : "No leases yet"}</p><p className="mt-1 text-sm text-slate-500">{connectionStatus === "error" ? "Reconnect to the backend to load lease records." : "Create a lease to connect residents with a unit and start tracking occupancy."}</p></td></tr>}
                        </tbody>
                    </table>
                    <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">Showing {filteredLeases.length} of {leases.length} leases · Saved in this browser</div>
                </div>
            </section>

            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <button type="button" aria-label="Close lease dialog" className="absolute inset-0 cursor-default" onClick={() => setDialogOpen(false)} />
                    <div role="dialog" aria-modal="true" aria-labelledby="create-lease-title" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><h2 id="create-lease-title" className="text-lg font-semibold text-slate-950">Create lease</h2><p className="mt-1 text-sm text-slate-500">Choose all residents covered by this agreement.</p></div><button type="button" aria-label="Close dialog" onClick={() => setDialogOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
                        <form onSubmit={submitLease} className="mt-5 space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Residents <span className="font-normal text-slate-500">({selectedResidentIds.length} selected)</span></label>
                            <div className="max-h-40 divide-y divide-slate-100 overflow-y-auto border border-slate-200">
                                {residents.map((resident) => <label key={resident.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50"><input type="checkbox" checked={selectedResidentIds.includes(resident.id)} onChange={() => toggleResident(resident.id)} className="h-4 w-4 accent-emerald-700" /><span className="min-w-0 flex-1 truncate text-slate-800">{resident.firstName} {resident.surname}</span><span className="text-xs text-slate-500">{resident.whatsappNumber}</span></label>)}
                                {!residents.length && <p className="px-3 py-4 text-sm text-slate-500">Add a resident before creating a lease.</p>}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-slate-700">Start date<input required type="date" name="startDate" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                                <label className="block text-sm font-medium text-slate-700">End date<input required type="date" name="endDate" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                            </div>
                            <label className="block text-sm font-medium text-slate-700">Available unit<select required name="unitId" defaultValue="" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"><option value="" disabled>{startDate && endDate ? "Select a unit" : "Choose dates to check availability"}</option>{eligibleUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber} · Floor {unit.floor}</option>)}</select></label>
                            {startDate && endDate && !eligibleUnits.length && <p className="text-sm text-amber-800">No unit is available for the selected dates.</p>}
                            <label className="block text-sm font-medium text-slate-700">Monthly rent<input required type="number" name="rent" min="0.01" step="0.01" placeholder="0.00" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                            {formError && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}
                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={() => setDialogOpen(false)} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={!selectedResidentIds.length || !eligibleUnits.length} className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">Create lease</button></div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

import React, { useState } from "react";
import { Building2, Check, Plus, Search } from "lucide-react";
import CreateUnitModal from "../components/unit/createUnitModal";
import PageHeader from "../components/layout/PageHeader";
import SectionHeading from "../components/layout/SectionHeading";
import MetricItem from "../components/layout/MetricItem";
import { getUnitLease, useRentalData } from "../state/RentalDataContext";

export default function Unitpage(){
    const { units: storedUnits, leases, createUnit: addUnit, connectionStatus } = useRentalData();
    const units = storedUnits.map((unit) => ({ ...unit, isOccupied: Boolean(getUnitLease(unit.id, leases)) }));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [createError, setCreateError] = useState("");

    const occupiedCount = units.filter((unit) => unit.isOccupied).length;
    const availableCount = units.length - occupiedCount;
    const unclassifiedCount = units.length - occupiedCount - availableCount;
    const occupiedPercent = units.length ? (occupiedCount / units.length) * 100 : 0;
    const filteredUnits = units.filter((unit) => {
        const matchesSearch = `${unit.unitNumber} ${unit.floor}`
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        const matchesStatus = statusFilter === "all"
            || (statusFilter === "leased" && unit.isOccupied)
            || (statusFilter === "available" && !unit.isOccupied);

        return matchesSearch && matchesStatus;
    });

    const createUnit = async (unitData) => {
        try {
            await addUnit(unitData);
            setCreateError("");
        } catch (error) {
            setCreateError(error.message);
            throw error;
        }
    };

    return (
        <section className="mx-auto w-full max-w-375 text-slate-900">
            <PageHeader>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={connectionStatus !== "connected"}
                    className="inline-flex shrink-0 items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={17} aria-hidden="true" />
                    Create unit
                </button>
            </PageHeader>

            {createError && <p role="alert" className="mt-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{createError}</p>}

            <section aria-labelledby="unit-summary-heading" className="grid gap-6 border-b border-slate-200 py-7 lg:grid-cols-[minmax(270px,0.85fr)_1.5fr]">
                <div className="flex min-h-52 items-center gap-6 border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <div
                        className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
                        style={{ background: `conic-gradient(#e7844b ${occupiedPercent}%, #a9d8bc 0)` }}
                        role="img"
                        aria-label={`${occupiedCount} leased and ${availableCount} available units`}
                    >
                        <div className="grid h-24 w-24 place-content-center rounded-full bg-white text-center">
                            <span className="text-2xl font-semibold tabular-nums text-slate-950">{units.length}</span>
                            <span className="text-xs text-slate-500">total units</span>
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h2 id="unit-summary-heading" className="text-sm font-semibold text-slate-900">Occupancy</h2>
                        <div className="mt-5 space-y-2.5 text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#e7844b]" />
                                <span>Leased</span><strong className="ml-auto tabular-nums text-slate-900">{occupiedCount}</strong>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#a9d8bc]" />
                                <span>Available</span><strong className="ml-auto tabular-nums text-slate-900">{availableCount}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border border-slate-200 sm:grid-cols-4 sm:divide-y-0">
                    <MetricItem label="Total units" value={units.length} className="p-4 sm:p-5" />
                    <MetricItem label="Available" value={availableCount} valueClassName="text-emerald-700" className="p-4 sm:p-5" />
                    <MetricItem label="Leased" value={occupiedCount} valueClassName="text-[#bd6535]" className="p-4 sm:p-5" />
                    <MetricItem label="Unclassified" value={unclassifiedCount} valueClassName="text-slate-700" className="p-4 sm:p-5" />
                </div>
            </section>

            <section aria-labelledby="unit-list-heading" className="pt-7">
                <SectionHeading id="unit-list-heading" icon={Building2} title="All units" description="Search and filter your property inventory.">
                        <label className="relative block sm:w-64">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search unit or floor"
                                aria-label="Search by unit number or floor"
                                className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                            />
                        </label>
                        <div className="flex h-10 items-center border border-slate-300 bg-white p-1" role="group" aria-label="Filter units by occupancy">
                            {[
                                ["all", "All"],
                                ["available", "Available"],
                                ["leased", "Leased"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={statusFilter === value}
                                    onClick={() => setStatusFilter(value)}
                                    className={`h-full px-3 text-xs font-medium transition-colors ${statusFilter === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                </SectionHeading>

                <div className="mt-5 overflow-x-auto border border-slate-200">
                      <table className="w-full min-w-140 border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                                <th scope="col" className="px-5 py-3.5">Unit number</th>
                                <th scope="col" className="px-5 py-3.5">Floor</th>
                                <th scope="col" className="px-5 py-3.5">Occupancy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnits.length ? filteredUnits.map((unit) => (
                                <tr key={unit.unitNumber} className="transition-colors hover:bg-slate-50/80">
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{unit.unitNumber}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{unit.floor}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${unit.isOccupied ? "text-[#a75328]" : "text-emerald-800"}`}>
                                            {unit.isOccupied ? <Check size={14} aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                                            {unit.isOccupied ? "Leased" : "Available"}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-5 py-14 text-center">
                                        <p className="text-sm font-medium text-slate-700">{units.length ? "No matching units" : connectionStatus === "loading" ? "Loading units…" : connectionStatus === "error" ? "Unit data unavailable" : "No units added yet"}</p>
                                        <p className="mt-1 text-sm text-slate-500">{units.length ? "Try another search or filter." : connectionStatus === "error" ? "Reconnect to the backend to load property inventory." : "Create a unit to start building your inventory."}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {units.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
                            <span>Showing {filteredUnits.length} of {units.length} units</span>
                            <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-700" aria-hidden="true" /> Saved in this browser</span>
                        </div>
                    )}
                </div>
            </section>

            <CreateUnitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={createUnit}
            />
        </section>
    );
}
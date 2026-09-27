import React, { useMemo, useState } from "react";
import { BadgeCheck, Check, ChevronLeft, ChevronRight, CircleUserRound, Edit2, MessageCircle, Plus, Search, ShieldCheck, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getLeaseStatus, getUnitLease, useRentalData } from "../state/RentalDataContext";
import PageHeader from "../components/layout/PageHeader";
import SectionHeading from "../components/layout/SectionHeading";
import CircularMetric from "../components/layout/CircularMetric";
import LeasePage from "./LeasePage";

const pageSize = 20;

function formatDate(value) {
    if (!value) return "Not recorded";
    return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getActiveLease(leases) {
    return leases
        .filter((lease) => ["ACTIVE", "PENDING"].includes(getLeaseStatus(lease)))
        .sort((first, second) => first.startDate.localeCompare(second.startDate))
        .map((lease) => ({ ...lease, currentStatus: getLeaseStatus(lease) }))[0];
}

export default function ResidentsPage() {
    const { residents, leases, units, createResident, updateResident, createLease, connectionStatus } = useRentalData();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = searchParams.get("view") === "leases" ? "leases" : "residents";
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [actionError, setActionError] = useState("");
    const [dialog, setDialog] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const matchingResidents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return residents;
        return residents.filter((resident) =>
            [resident.firstName, resident.surname, resident.whatsappNumber]
                .some((value) => value.toLowerCase().includes(query)));
    }, [residents, search]);
    const totalElements = matchingResidents.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const visibleResidents = matchingResidents.slice(page * pageSize, (page + 1) * pageSize);

    const linkedResidentIds = useMemo(() => new Set(
        leases
            .filter((lease) => ["ACTIVE", "PENDING"].includes(getLeaseStatus(lease)))
            .flatMap((lease) => lease.residents.map((resident) => resident.id))
    ), [leases]);
    const saveResident = async (event) => {
        event.preventDefault();
        if (!dialog) return;
        setIsSaving(true);
        setActionError("");
        const form = event.currentTarget;
        const formData = new FormData(form);
        const resident = {
            firstName: formData.get("firstName").trim(),
            surname: formData.get("surname").trim(),
            whatsappNumber: formData.get("whatsappNumber").trim(),
            whatsappUpdatesConsented: formData.get("whatsappUpdatesConsented") === "on",
        };

        try {
            const savedResident = dialog.mode === "edit"
                ? await updateResident(dialog.resident.id, resident)
                : await createResident(resident);
            setSearch("");
            setPage(0);
            setDialog(dialog.mode === "create" ? { mode: "afterCreate", resident: savedResident } : null);
        } catch (saveError) {
            setActionError(saveError.message);
        } finally {
            setIsSaving(false);
        }
    };

    const submitLease = async (event) => {
        event.preventDefault();
        if (!dialog) return;
        setIsSaving(true);
        setActionError("");
        const formData = new FormData(event.currentTarget);
        const leaseRequest = {
            unitId: Number(formData.get("unitId")),
            residentIds: [dialog.resident.id],
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
            rent: Number(formData.get("rent")),
        };

        try {
            await createLease(leaseRequest);
            setDialog(null);
            setActionError("");
        } catch (saveError) {
            setActionError(saveError.message);
        } finally {
            setIsSaving(false);
        }
    };

    const availableUnits = units.filter((unit) => !getUnitLease(unit.id, leases));

    return (
        <section className="mx-auto w-full max-w-375 text-slate-900">
            <PageHeader>
                {activeView === "residents" && (
                    <button
                        type="button"
                        onClick={() => { setActionError(""); setDialog({ mode: "create" }); }}
                        disabled={connectionStatus !== "connected"}
                        className="inline-flex shrink-0 items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={17} aria-hidden="true" />
                        Add resident
                    </button>
                )}
            </PageHeader>

            <div className="mt-5 flex border-b border-slate-200" role="tablist" aria-label="Residents and leases">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === "residents"}
                    onClick={() => setSearchParams({})}
                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeView === "residents" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >Residents</button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === "leases"}
                    onClick={() => setSearchParams({ view: "leases" })}
                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeView === "leases" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >Leases <span className="ml-1 tabular-nums text-xs text-slate-400">{leases.length}</span></button>
            </div>

            {actionError && (
                <div role="alert" className="mt-5 flex items-start justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <span>{actionError}</span>
                    <button type="button" aria-label="Dismiss message" onClick={() => setActionError("")} className="p-0.5 text-amber-800 hover:text-amber-950"><X size={16} /></button>
                </div>
            )}

            {activeView === "leases" ? <LeasePage embedded /> : <>
            <section aria-label="Resident overview" className="grid gap-8 border-b border-slate-200 py-7 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr] lg:items-center">
                <CircularMetric
                    value={totalElements ? Math.round((linkedResidentIds.size / totalElements) * 100) : 0}
                    label="Lease coverage"
                    detail={`${linkedResidentIds.size} of ${totalElements} residents have an active or pending lease`}
                    size="large"
                />
                <div className="grid grid-cols-2 border-l border-slate-200 pl-6 sm:grid-cols-3">
                    <div className="py-2 pr-4"><span className="block text-xs text-slate-500">Total residents</span><strong className="mt-2 block text-2xl font-semibold tabular-nums text-slate-950">{totalElements}</strong></div>
                    <div className="border-l border-slate-200 px-4 py-2"><span className="block text-xs text-slate-500">Lease assigned</span><strong className="mt-2 block text-2xl font-semibold tabular-nums text-slate-950">{linkedResidentIds.size}</strong></div>
                    <div className="border-l border-slate-200 px-4 py-2"><span className="block text-xs text-slate-500">WhatsApp consent</span><strong className="mt-2 block text-2xl font-semibold tabular-nums text-emerald-700">{residents.filter((resident) => resident.whatsappUpdatesConsented).length}</strong></div>
                </div>
            </section>

            <section aria-labelledby="resident-list-heading" className="pt-7">
                <SectionHeading id="resident-list-heading" icon={CircleUserRound} title="Resident directory" description="Contact details and current lease assignment.">
                    <label className="relative block sm:w-72">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
                            placeholder="Search residents"
                            aria-label="Search residents"
                            className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                    </label>
                </SectionHeading>

                <div className="mt-5 overflow-x-auto border border-slate-200">
                    <table className="w-full min-w-250 border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                                <th scope="col" className="px-5 py-3.5">Resident</th>
                                <th scope="col" className="px-5 py-3.5">WhatsApp contact</th>
                                <th scope="col" className="px-5 py-3.5">Current lease</th>
                                <th scope="col" className="px-5 py-3.5">Messaging consent</th>
                                <th scope="col" className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visibleResidents.length ? visibleResidents.map((resident) => {
                                const currentLease = getActiveLease(leases.filter((lease) => lease.residents.some((linkedResident) => linkedResident.id === resident.id)));
                                return (
                                    <tr key={resident.id} className="transition-colors hover:bg-slate-50/80">
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="text-sm font-semibold text-slate-900">{resident.firstName} {resident.surname}</div>
                                            <div className="mt-0.5 text-xs text-slate-500">Added {formatDate(resident.createdAt)}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700"><MessageCircle size={15} className="text-emerald-700" aria-hidden="true" />{resident.whatsappNumber}</div>
                                            <div className={`mt-1 flex items-center gap-1.5 text-xs ${resident.whatsappNumberVerified ? "text-emerald-800" : "text-slate-500"}`}>
                                                {resident.whatsappNumberVerified ? <BadgeCheck size={13} aria-hidden="true" /> : <ShieldCheck size={13} aria-hidden="true" />}
                                                {resident.whatsappNumberVerified ? "Number verified" : "Not verified"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {currentLease ? (
                                                <>
                                                    <div className="text-sm font-medium text-slate-800">Unit {currentLease.unitNumber}</div>
                                                    <div className="mt-0.5 text-xs text-slate-500">{currentLease.currentStatus === "PENDING" ? "Starts" : "Ends"} {formatDate(currentLease.currentStatus === "PENDING" ? currentLease.startDate : currentLease.endDate)}</div>
                                                </>
                                            ) : <span className="text-sm text-slate-500">No current lease</span>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${resident.whatsappUpdatesConsented ? "text-emerald-800" : "text-slate-500"}`}>
                                                {resident.whatsappUpdatesConsented ? <Check size={14} aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
                                                {resident.whatsappUpdatesConsented ? "Opted in" : "Not opted in"}
                                            </span>
                                            {resident.whatsappUpdatesConsented && <div className="mt-1 text-xs text-slate-500">Since {formatDate(resident.whatsappConsentRecordedAt)}</div>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title="Edit resident"
                                                    aria-label={`Edit ${resident.firstName} ${resident.surname}`}
                                                    onClick={() => { setActionError(""); setDialog({ mode: "edit", resident }); }}
                                                    className="p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                ><Edit2 size={16} /></button>
                                                {!currentLease && (
                                                    <button
                                                        type="button"
                                                        title="Assign lease"
                                                        aria-label={`Assign lease to ${resident.firstName} ${resident.surname}`}
                                                        onClick={() => { setActionError(""); setDialog({ mode: "lease", resident }); }}
                                                        className="border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                                    >Assign lease</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-5 py-14 text-center">
                                        <p className="text-sm font-medium text-slate-700">{residents.length ? "No matching residents" : connectionStatus === "loading" ? "Loading residents…" : connectionStatus === "error" ? "Resident data unavailable" : "No residents added yet"}</p>
                                        <p className="mt-1 text-sm text-slate-500">{residents.length ? "Try a different name or phone number." : connectionStatus === "error" ? "Reconnect to the backend to load resident records." : "Add a resident to keep their contact and tenancy details together."}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>Showing {totalElements === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)} of {totalElements} residents</span>
                        <div className="flex items-center gap-3">
                            <span>Page {totalPages ? page + 1 : 0} of {totalPages}</span>
                            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page" className="border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
                            <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page" className="border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </section>

            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <button type="button" aria-label="Close dialog" className="absolute inset-0 cursor-default" onClick={() => !isSaving && setDialog(null)} />
                    <div role="dialog" aria-modal="true" aria-labelledby="resident-dialog-title" className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h2 id="resident-dialog-title" className="text-lg font-semibold text-slate-950">
                                    {dialog.mode === "create" ? "Add resident" : dialog.mode === "edit" ? "Edit resident" : dialog.mode === "afterCreate" ? "Resident added" : "Assign a lease"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {dialog.mode === "lease" ? `Create a lease for ${dialog.resident.firstName} ${dialog.resident.surname}.` : dialog.mode === "afterCreate" ? "Would you like to assign a unit now? You can do this later from the Residents or Leases section." : "Keep contact details accurate and consent explicit."}
                                </p>
                            </div>
                            <button type="button" aria-label="Close dialog" disabled={isSaving} onClick={() => setDialog(null)} className="p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"><X size={18} /></button>
                        </div>

                        {dialog.mode === "afterCreate" ? (
                            <div className="mt-5 space-y-5">
                                <div className="border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-sm font-semibold text-emerald-900">{dialog.resident.firstName} {dialog.resident.surname} is in your resident directory.</p>
                                    <p className="mt-1 text-sm text-emerald-800">Their WhatsApp number is saved; no message has been sent.</p>
                                </div>
                                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                    <button type="button" onClick={() => setDialog(null)} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Done for now</button>
                                    <button type="button" onClick={() => { setActionError(""); setDialog({ mode: "lease", resident: dialog.resident }); }} className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Assign a lease</button>
                                </div>
                            </div>
                        ) : dialog.mode === "lease" ? (
                            <form onSubmit={submitLease} className="mt-5 space-y-4">
                                {availableUnits.length ? (
                                    <label className="block text-sm font-medium text-slate-700">
                                        Available unit
                                        <select required name="unitId" defaultValue="" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700">
                                            <option value="" disabled>Select a unit</option>
                                            {availableUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber} · Floor {unit.floor}</option>)}
                                        </select>
                                    </label>
                                ) : <p className="border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">No available units. Add a unit or cancel/expire an existing lease first.</p>}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="block text-sm font-medium text-slate-700">Start date<input required type="date" name="startDate" min={new Date().toISOString().slice(0, 10)} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                                    <label className="block text-sm font-medium text-slate-700">End date<input required type="date" name="endDate" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                                </div>
                                <label className="block text-sm font-medium text-slate-700">Monthly rent<input required type="number" name="rent" min="0.01" step="0.01" className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" placeholder="0.00" /></label>
                                <p className="text-xs leading-5 text-slate-500">This creates a pending lease for future start dates, or an active lease starting today.</p>
                                {actionError && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>}
                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                    <button type="button" disabled={isSaving} onClick={() => setDialog(null)} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" disabled={isSaving || !availableUnits.length} className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Creating..." : "Create lease"}</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={saveResident} className="mt-5 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="block text-sm font-medium text-slate-700">First name<input required maxLength="80" name="firstName" defaultValue={dialog.resident?.firstName || ""} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                                    <label className="block text-sm font-medium text-slate-700">Surname<input required maxLength="80" name="surname" defaultValue={dialog.resident?.surname || ""} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" /></label>
                                </div>
                                <label className="block text-sm font-medium text-slate-700">
                                    WhatsApp number
                                    <input required type="tel" name="whatsappNumber" pattern="\+[1-9][0-9]{7,14}" placeholder="+254712345678" defaultValue={dialog.resident?.whatsappNumber || ""} className="mt-1.5 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" />
                                    <span className="mt-1 block text-xs font-normal text-slate-500">Use international format, including the +country code.</span>
                                </label>
                                <label className="flex items-start gap-3 border border-slate-200 bg-slate-50 p-3.5">
                                    <input type="checkbox" name="whatsappUpdatesConsented" defaultChecked={dialog.resident?.whatsappUpdatesConsented || false} className="mt-0.5 h-4 w-4 accent-emerald-700" />
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">Resident agreed to WhatsApp updates</span>
                                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">Record consent only when it has been explicitly given. This does not send a message.</span>
                                    </span>
                                </label>
                                {dialog.resident?.whatsappNumberVerified && <p className="text-xs text-emerald-800">This number is verified. Changing it will require verification again.</p>}
                                {actionError && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>}
                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                    <button type="button" disabled={isSaving} onClick={() => setDialog(null)} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" disabled={isSaving} className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving..." : dialog.mode === "create" ? "Add resident" : "Save changes"}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            </>}
        </section>
    );
}
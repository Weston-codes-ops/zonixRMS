import React, { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock3, Plus, Search, Wrench, X } from "lucide-react";
import { useRentalData } from "../state/RentalDataContext";
import PageHeader from "../components/layout/PageHeader";
import SectionHeading from "../components/layout/SectionHeading";
import MetricItem from "../components/layout/MetricItem";

const categoryLabels = {
    PLUMBING: "Plumbing",
    ELECTRICAL: "Electrical",
    HVAC: "HVAC",
    STRUCTURAL: "Structural",
    PEST_CONTROL: "Pest control",
    APPLIANCE: "Appliance",
    OTHER: "Other",
};

function formatDate(date) {
    const normalizedDate = date.length > 10 ? date : `${date}T00:00:00`;
    return new Date(normalizedDate).toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function MaintenancePage() {
    const { tickets, residents, staffUsers, createTicket: addTicket, updateTicketStatus, connectionStatus } = useRentalData();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [reporterType, setReporterType] = useState("RESIDENT");
    const [formError, setFormError] = useState("");
    const [statusError, setStatusError] = useState("");

    const solvedCount = tickets.filter((ticket) => ticket.isSolved).length;
    const unsolvedCount = tickets.length - solvedCount;
    const successRate = tickets.length ? Math.round((solvedCount / tickets.length) * 100) : 0;
    const visibleTickets = useMemo(() => {
        const query = search.trim().toLowerCase();
        return tickets.filter((ticket) => {
            const matchesSearch = [ticket.ticketNumber, ticket.reporterName, ticket.reporterType, ticket.issue, categoryLabels[ticket.category]]
                .some((value) => value.toLowerCase().includes(query));
            const matchesStatus = statusFilter === "all"
                || (statusFilter === "solved" && ticket.isSolved)
                || (statusFilter === "unsolved" && !ticket.isSolved);
            return matchesSearch && matchesStatus;
        });
    }, [tickets, search, statusFilter]);

    const createTicket = async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        try {
            await addTicket({
                reporterType,
                reporterId: values.reporterId,
                reporterName: values.reporterName,
                issue: values.issue,
                category: values.category,
            });
            setStatusFilter("all");
            setSearch("");
            setFormError("");
            setIsCreateOpen(false);
        } catch (error) {
            setFormError(error.message);
        }
    };

    return (
        <section className="mx-auto w-full max-w-375 text-slate-900">
            <PageHeader>
                <button
                    type="button"
                    onClick={() => { setReporterType(residents.length ? "RESIDENT" : "STAFF"); setFormError(""); setIsCreateOpen(true); }}
                    disabled={connectionStatus !== "connected"}
                    className="inline-flex shrink-0 items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={17} aria-hidden="true" />
                    Create ticket
                </button>
            </PageHeader>

            <section aria-label="Maintenance metrics" className="grid border-b border-slate-200 py-7 sm:grid-cols-2 lg:grid-cols-4">
                <MetricItem icon={ClipboardList} label="Total tickets" value={tickets.length} detail="All reported maintenance issues" className="min-h-32 border-b border-slate-200 sm:border-r sm:px-5 sm:first:pl-0 lg:border-b-0" valueClassName="text-3xl text-slate-950" />
                <MetricItem icon={CheckCircle2} label="Solved" value={solvedCount} detail="Requests marked complete" className="min-h-32 border-b border-slate-200 sm:border-r sm:px-5 lg:border-b-0" valueClassName="text-3xl text-emerald-700" />
                <MetricItem icon={Clock3} label="Unsolved" value={unsolvedCount} detail="Still awaiting resolution" className="min-h-32 border-b border-slate-200 sm:border-r sm:px-5 sm:border-b-0" valueClassName="text-3xl text-[#bd6535]" />
                <article className="flex min-h-32 flex-col justify-between py-4 sm:px-5 sm:pr-0">
                    <MetricItem icon={Wrench} label="Success rate" value={`${successRate}%`} className="min-h-0 p-0" valueClassName="text-3xl text-slate-950" />
                    <div>
                        <div className="h-1.5 overflow-hidden bg-slate-100" role="meter" aria-label="Maintenance success rate" aria-valuemin="0" aria-valuemax="100" aria-valuenow={successRate}>
                            <div className="h-full bg-emerald-700 transition-[width]" style={{ width: `${successRate}%` }} />
                        </div>
                        <span className="mt-1.5 block text-xs text-slate-500">Solved tickets ÷ total tickets</span>
                    </div>
                </article>
            </section>

            <section aria-labelledby="ticket-list-heading" className="pt-7">
                <SectionHeading id="ticket-list-heading" icon={Wrench} title="Maintenance tickets" description="Search requests and filter by resolution status.">
                        <label className="relative block sm:w-64">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search tickets"
                                aria-label="Search tickets"
                                className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                            />
                        </label>
                        <div className="flex h-10 items-center border border-slate-300 bg-white p-1" role="group" aria-label="Filter tickets by status">
                            {[["all", "All"], ["unsolved", "Unsolved"], ["solved", "Solved"]].map(([value, label]) => (
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
                    <table className="w-full min-w-250 border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Ticket no.</th>
                                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Reporter</th>
                                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Report time</th>
                                <th scope="col" className="px-5 py-3.5">Issue</th>
                                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Category</th>
                                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visibleTickets.length ? visibleTickets.map((ticket) => (
                                <tr key={ticket.id} className="transition-colors hover:bg-slate-50/80">
                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">{ticket.ticketNumber}</td>
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <div className="text-sm font-medium text-slate-800">{ticket.reporterName}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">{ticket.reporterType}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(ticket.reportedAt)}</td>
                                    <td className="max-w-80 px-5 py-4 text-sm text-slate-700">{ticket.issue}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{categoryLabels[ticket.category]}</td>
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ticket.isSolved ? "text-emerald-800" : "text-[#a75328]"}`}>
                                                <span className={`h-2 w-2 rounded-full ${ticket.isSolved ? "bg-emerald-600" : "bg-[#d77943]"}`} />
                                                {ticket.isSolved ? "Solved" : "Not solved"}
                                            </span>
                                            <button type="button" onClick={() => updateTicketStatus(ticket.id, !ticket.isSolved).catch((error) => setStatusError(error.message))} className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-900">{ticket.isSolved ? "Reopen" : "Resolve"}</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-5 py-14 text-center">
                                        <p className="text-sm font-medium text-slate-700">{tickets.length ? "No matching tickets" : connectionStatus === "loading" ? "Loading tickets…" : connectionStatus === "error" ? "Maintenance data unavailable" : "No maintenance tickets yet"}</p>
                                        <p className="mt-1 text-sm text-slate-500">{tickets.length ? "Try a different search or status filter." : connectionStatus === "error" ? "Reconnect to the backend to load maintenance records." : "Create a ticket to record a resident or property manager request."}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
                        <span>Showing {visibleTickets.length} of {tickets.length} tickets</span>
                        <span>Saved in this browser</span>
                    </div>
                </div>
            </section>

            {statusError && <div role="alert" className="mt-4 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{statusError}</div>}

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <button type="button" aria-label="Close create ticket dialog" className="absolute inset-0 cursor-default" onClick={() => setIsCreateOpen(false)} />
                    <div role="dialog" aria-modal="true" aria-labelledby="create-ticket-title" className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h2 id="create-ticket-title" className="text-lg font-semibold text-slate-950">Create maintenance ticket</h2>
                                <p className="mt-1 text-sm text-slate-500">Add a repair request to the list.</p>
                            </div>
                            <button type="button" aria-label="Close dialog" onClick={() => setIsCreateOpen(false)} className="p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button>
                        </div>
                        <form onSubmit={createTicket} className="mt-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block text-sm font-medium text-slate-700">
                                    Reporter type
                                    <select value={reporterType} onChange={(event) => setReporterType(event.target.value)} className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700">
                                        <option value="RESIDENT" disabled={!residents.length}>Resident</option>
                                        <option value="STAFF" disabled={!staffUsers.length}>Property manager</option>
                                    </select>
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                    Category
                                    <select name="category" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700">
                                        {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </label>
                            </div>
                            {reporterType === "RESIDENT" ? (
                                <label className="block text-sm font-medium text-slate-700">
                                    Resident
                                    <select required name="reporterId" defaultValue="" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700">
                                        <option value="" disabled>Select a resident</option>
                                        {residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.firstName} {resident.surname} · {resident.whatsappNumber}</option>)}
                                    </select>
                                </label>
                            ) : (
                                <label className="block text-sm font-medium text-slate-700">
                                    Property manager
                                    <select required name="reporterId" defaultValue="" className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700">
                                        <option value="" disabled>Select a staff account</option>
                                        {staffUsers.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {user.role}</option>)}
                                    </select>
                                </label>
                            )}
                            <label className="block text-sm font-medium text-slate-700">
                                Issue
                                <textarea required name="issue" rows="3" className="mt-1.5 w-full resize-y border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700" placeholder="Describe the maintenance issue" />
                            </label>
                            {formError && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}
                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">Add ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
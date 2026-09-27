import React from "react";
import { ArrowRight, BellRing, Building2, ClipboardList, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getLeaseStatus, getUnitLease, useRentalData } from "../state/RentalDataContext";
import PageHeader from "../components/layout/PageHeader";
import SectionHeading from "../components/layout/SectionHeading";
import MetricItem from "../components/layout/MetricItem";
import ProgressBar from "../components/layout/ProgressBar";

export default function Dashboardpage() {
	const { units, residents, leases, tickets } = useRentalData();
	const activeLeases = leases.filter((lease) => getLeaseStatus(lease) === "ACTIVE");
	const pendingLeases = leases.filter((lease) => getLeaseStatus(lease) === "PENDING");
	const availableUnits = units.filter((unit) => !getUnitLease(unit.id, leases)).length;
	const solvedTickets = tickets.filter((ticket) => ticket.isSolved).length;
	const openTickets = tickets.length - solvedTickets;
	const consentedResidents = residents.filter((resident) => resident.whatsappUpdatesConsented).length;
	const occupiedUnits = units.length - availableUnits;
	const unitUtilization = units.length ? Math.round((occupiedUnits / units.length) * 100) : 0;
	const leasedResidentIds = new Set(
		leases
			.filter((lease) => ["ACTIVE", "PENDING"].includes(getLeaseStatus(lease)))
			.flatMap((lease) => lease.residentIds || lease.residents.map((resident) => resident.id))
	);
	const residentLeaseCoverage = residents.length ? Math.round((leasedResidentIds.size / residents.length) * 100) : 0;
	const resolutionPercent = tickets.length ? Math.round((solvedTickets / tickets.length) * 100) : 0;
	const maintenanceHealth = resolutionPercent;
	const weightedSignals = [
		{ value: unitUtilization, weight: 40 },
		{ value: residentLeaseCoverage, weight: 30 },
		{ value: maintenanceHealth, weight: 30 },
	];
	const totalWeight = weightedSignals.reduce((total, signal) => total + signal.weight, 0);
	const propertyStrength = totalWeight
		? Math.round(weightedSignals.reduce((total, signal) => total + signal.value * signal.weight, 0) / totalWeight)
		: 0;
	const ownerTasks = [
		...(units.length === 0 ? [{ label: "Add your first units", detail: "Set up the property inventory", path: "/units" }] : []),
		...(residents.length === 0 ? [{ label: "Register your residents", detail: "Add contacts before assigning leases", path: "/residents" }] : []),
		...(availableUnits > 0 && residents.length > 0 ? [{ label: "Review available units", detail: `${availableUnits} unit${availableUnits === 1 ? "" : "s"} ready for assignment`, path: "/residents?view=leases" }] : []),
		...(pendingLeases.length > 0 ? [{ label: "Prepare upcoming leases", detail: `${pendingLeases.length} lease${pendingLeases.length === 1 ? "" : "s"} waiting to start`, path: "/residents?view=leases" }] : []),
		...(consentedResidents < residents.length && residents.length > 0 ? [{ label: "Review WhatsApp consent", detail: `${residents.length - consentedResidents} resident${residents.length - consentedResidents === 1 ? "" : "s"} not opted in`, path: "/residents" }] : []),
		...(openTickets > 0 ? [{ label: "Review maintenance tickets", detail: `${openTickets} request${openTickets === 1 ? "" : "s"} need attention`, path: "/maintenance" }] : []),
	];

	return (
		<section className="mx-auto w-full max-w-375 text-slate-900">
			<PageHeader />

        				<section aria-labelledby="performance-heading" className="border border-slate-200 p-5 sm:p-6">
					<SectionHeading id="performance-heading" title="Property performance" description="How the property is doing right now." />
					<div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
						<div className="grid h-40 w-40 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#16805b ${propertyStrength}%, #c8e5da 0)` }} role="img" aria-label={`${propertyStrength}% overall property strength`}>
							<div className="grid h-28 w-28 place-content-center rounded-full bg-white text-center"><strong className="text-3xl font-semibold tabular-nums text-slate-950">{propertyStrength}%</strong><span className="text-xs text-slate-500">property strength</span></div>
						</div>
						<div className="min-w-0 space-y-5">
							<div><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-medium text-slate-800">Unit utilization <span className="font-normal text-slate-500">(40%)</span></span><span className="tabular-nums text-slate-500">{unitUtilization}%</span></div><ProgressBar value={unitUtilization} label={`${occupiedUnits} leased · ${availableUnits} available`} /></div>
							<div><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-medium text-slate-800">Resident lease coverage <span className="font-normal text-slate-500">(30%)</span></span><span className="tabular-nums text-slate-500">{residentLeaseCoverage}%</span></div><ProgressBar value={residentLeaseCoverage} label={`${leasedResidentIds.size} residents linked to leases`} colorClassName="bg-slate-700" /></div>
							<div><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-medium text-slate-800">Maintenance health <span className="font-normal text-slate-500">(30%)</span></span><span className="tabular-nums text-slate-500">{maintenanceHealth}%</span></div><ProgressBar value={maintenanceHealth} label={tickets.length ? `${solvedTickets} resolved · ${openTickets} open` : "No tickets to address"} colorClassName="bg-[#d77943]" /></div>
						</div>
					</div>
				</section>

        
			

			<div className="grid gap-6 border-t border-slate-200 py-7">
                 <section aria-label="Property metrics" className="mt-7 grid border-y border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
				<MetricItem to="/units" icon={Building2} label="Total units" value={units.length} detail={`${availableUnits} available`} valueClassName="text-3xl text-emerald-700" className="border-b border-slate-200 px-4 sm:border-b-0 sm:border-r sm:first:pl-0 lg:py-5" />
				<MetricItem to="/residents" icon={Users} label="Residents" value={residents.length} detail={`${consentedResidents} opted in to WhatsApp`} valueClassName="text-3xl text-slate-950" className="border-b border-slate-200 px-4 sm:border-b-0 sm:border-r lg:py-5" />
				<MetricItem to="/leases" icon={FileText} label="Active leases" value={activeLeases.length} detail={`${pendingLeases.length} pending start`} valueClassName="text-3xl text-slate-950" className="border-b border-slate-200 px-4 lg:border-b-0 lg:border-r lg:py-5" />
				<MetricItem to="/maintenance" icon={ClipboardList} label="Open maintenance" value={openTickets} detail={`${solvedTickets} resolved`} valueClassName={`text-3xl ${openTickets ? "text-[#bd6535]" : "text-emerald-700"}`} className="px-4 lg:py-5" />
			</section>

				<section aria-labelledby="tasks-heading" className="border border-slate-200 p-5 sm:p-6">
					<SectionHeading id="tasks-heading" icon={BellRing} title="Tasks to do" description="Priorities that change with the property." />
					{ownerTasks.length ? <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{ownerTasks.slice(0, 5).map((task) => <li key={task.label}><Link to={task.path} className="flex items-center gap-3 py-3.5 hover:bg-slate-50"><span className="h-2 w-2 shrink-0 bg-[#d77943]" /><span className="min-w-0 flex-1"><strong className="block text-sm font-medium text-slate-800">{task.label}</strong><span className="block text-xs text-slate-500">{task.detail}</span></span><ArrowRight size={15} className="shrink-0 text-slate-400" /></Link></li>)}</ul> : <div className="mt-5 border-y border-slate-200 py-10 text-center"><p className="text-sm font-medium text-slate-700">Everything is up to date</p><p className="mt-1 text-xs text-slate-500">No immediate property tasks.</p></div>}
				</section>
			</div>

			<section aria-labelledby="maintenance-reminders-heading" className="border-t border-slate-200 py-7">
				<SectionHeading id="maintenance-reminders-heading" icon={ClipboardList} title="Maintenance reminders" description="Tickets the property owner should review." >
					<Link to="/maintenance" className="text-xs font-semibold text-emerald-800 hover:underline">Open maintenance</Link>
				</SectionHeading>
				{openTickets ? <div className="mt-5 overflow-x-auto border border-slate-200"><table className="w-full min-w-160 border-collapse text-left"><thead className="bg-slate-50"><tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500"><th className="px-5 py-3.5">Issue</th><th className="px-5 py-3.5">Reporter</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{tickets.filter((ticket) => !ticket.isSolved).slice(0, 5).map((ticket) => <tr key={ticket.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-sm font-medium text-slate-800">{ticket.issue}</td><td className="px-5 py-4 text-sm text-slate-600">{ticket.reporterName}</td><td className="px-5 py-4 text-sm text-slate-600">{ticket.category.replaceAll("_", " ")}</td><td className="px-5 py-4 text-xs font-medium text-[#a75328]">Needs review</td></tr>)}</tbody></table></div> : <div className="mt-5 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"><strong>Maintenance is clear.</strong> There are no open tickets to review.</div>}
			</section>
		</section>
	);
}

import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient, { getAllPages } from "../api/apiClient";

const RentalDataContext = createContext(null);

function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getLeaseStatus(lease, today = localDateString()) {
    if (lease.status === "CANCELLED") return "CANCELLED";
    if (lease.endDate < today) return "EXPIRED";
    if (lease.startDate > today) return "PENDING";
    return "ACTIVE";
}

export function getUnitLease(unitId, leases, today = localDateString()) {
    return leases.find((lease) =>
        Number(lease.unitId) === Number(unitId)
        && getLeaseStatus(lease, today) === "ACTIVE");
}

function mapLease(lease, residents) {
    return {
        ...lease,
        residentIds: lease.residents.map((resident) => resident.id),
        residents: lease.residents.map((linkedResident) => {
            const resident = residents.find((item) => item.id === linkedResident.id);
            if (resident) return resident;
            const [firstName, ...surnameParts] = (linkedResident.fullName || "").split(" ");
            return {
                id: linkedResident.id,
                firstName,
                surname: surnameParts.join(" "),
                whatsappNumber: linkedResident.whatsappNumber,
            };
        }),
    };
}

function mapTicket(ticket) {
    return {
        ...ticket,
        reporterId: ticket.reportedBy,
        reporterType: ticket.reporterType === "RESIDENT" ? "Resident" : "Property manager",
        isSolved: Boolean(ticket.isSolved),
    };
}

export function RentalDataProvider({ children }) {
    const [data, setData] = useState({ units: [], residents: [], leases: [], tickets: [], staffUsers: [] });
    const [connectionStatus, setConnectionStatus] = useState("loading");
    const [connectionError, setConnectionError] = useState("");

    const refreshData = async () => {
        setConnectionStatus("loading");
        setConnectionError("");
        try {
            const [units, residents, leases, tickets, staffUsers] = await Promise.all([
                getAllPages("/units/page"),
                getAllPages("/residents"),
                getAllPages("/leases/page"),
                getAllPages("/maintenance/page"),
                getAllPages("/users/page"),
            ]);
            setData({
                units,
                residents,
                leases: leases.map((lease) => mapLease(lease, residents)),
                tickets: tickets.map(mapTicket),
                staffUsers: staffUsers.filter((user) => user.role !== "TENANT"),
            });
            setConnectionStatus("connected");
        } catch (error) {
            setConnectionError(error.message);
            setConnectionStatus("error");
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const ensureConnected = () => {
        if (connectionStatus !== "connected") {
            throw new Error("Connect to the backend before making changes.");
        }
    };

    const createUnit = async (values) => {
        ensureConnected();
        const unitNumber = values.unitNumber.trim().toUpperCase();
        if (data.units.some((unit) => unit.unitNumber.toUpperCase() === unitNumber)) {
            throw new Error("A unit with this number already exists.");
        }
        const { data: unit } = await apiClient.post("/units", {
            unitNumber,
            floor: values.floor.trim(),
        });
        setData((current) => ({ ...current, units: [...current.units, unit] }));
        return unit;
    };

    const createResident = async (values) => {
        ensureConnected();
        const whatsappNumber = values.whatsappNumber.replace(/\s+/g, "");
        if (data.residents.some((resident) => resident.whatsappNumber === whatsappNumber)) {
            throw new Error("A resident with this WhatsApp number already exists.");
        }
        const { data: resident } = await apiClient.post("/residents", {
            firstName: values.firstName.trim(),
            surname: values.surname.trim(),
            whatsappNumber,
            whatsappUpdatesConsented: Boolean(values.whatsappUpdatesConsented),
        });
        setData((current) => ({ ...current, residents: [...current.residents, resident] }));
        return resident;
    };

    const updateResident = async (residentId, values) => {
        ensureConnected();
        const currentResident = data.residents.find((resident) => resident.id === residentId);
        if (!currentResident) throw new Error("Resident not found.");
        const whatsappNumber = values.whatsappNumber.replace(/\s+/g, "");
        if (data.residents.some((resident) => resident.id !== residentId && resident.whatsappNumber === whatsappNumber)) {
            throw new Error("A resident with this WhatsApp number already exists.");
        }
        const numberChanged = whatsappNumber !== currentResident.whatsappNumber;
        const { data: updatedResident } = await apiClient.patch(`/residents/${residentId}`, {
            firstName: values.firstName.trim(),
            surname: values.surname.trim(),
            whatsappNumber,
            whatsappUpdatesConsented: numberChanged ? false : Boolean(values.whatsappUpdatesConsented),
        });
        setData((current) => ({
            ...current,
            residents: current.residents.map((resident) => resident.id === residentId ? updatedResident : resident),
        }));
        return updatedResident;
    };

    const createLease = async (values) => {
        ensureConnected();
        const unit = data.units.find((item) => Number(item.id) === Number(values.unitId));
        if (!unit) throw new Error("Choose a unit that exists.");
        const residentIds = [...new Set(values.residentIds)];
        if (!residentIds.length) throw new Error("Add at least one resident to the lease.");
        const residents = residentIds.map((id) => data.residents.find((resident) => resident.id === id));
        if (residents.some((resident) => !resident)) throw new Error("One or more residents could not be found.");
        if (values.endDate < values.startDate) throw new Error("The end date must be on or after the start date.");
        if (Number(values.rent) <= 0 || !Number.isFinite(Number(values.rent))) throw new Error("Enter a valid rent amount greater than zero.");

        try {
            const { data: lease } = await apiClient.post("/leases", {
                unitId: unit.id,
                residentIds,
                startDate: values.startDate,
                endDate: values.endDate,
                rent: Number(values.rent),
            });
            const mappedLease = mapLease(lease, data.residents);
            setData((current) => ({ ...current, leases: [mappedLease, ...current.leases] }));
            return mappedLease;
        } catch (error) {
            if (error.message.includes("overlapping") || error.message.includes("occupied")) {
                throw new Error(error.message);
            }
            throw error;
        }
    };

    const cancelLease = async (leaseId) => {
        ensureConnected();
        const lease = data.leases.find((item) => item.id === leaseId);
        if (!lease || !["ACTIVE", "PENDING"].includes(getLeaseStatus(lease))) {
            throw new Error("Only pending or active leases can be cancelled.");
        }
        const { data: cancelledLease } = await apiClient.patch(`/leases/${leaseId}/cancel`);
        const mappedLease = mapLease(cancelledLease, data.residents);
        setData((current) => ({ ...current, leases: current.leases.map((item) => item.id === leaseId ? mappedLease : item) }));
    };

    const createTicket = async (values) => {
        ensureConnected();
        const resident = values.reporterType === "RESIDENT"
            ? data.residents.find((item) => item.id === values.reporterId)
            : null;
        if (values.reporterType === "RESIDENT" && !resident) {
            throw new Error("Choose a resident reporter.");
        }
        const reporterId = resident?.id || values.reporterId;
        if (!reporterId) throw new Error("Choose the staff reporter.");
        const path = resident ? `/maintenance/resident/${reporterId}` : `/maintenance/${reporterId}`;
        const { data } = await apiClient.post(path, {
            issue: values.issue.trim(),
            category: values.category,
        });
        const ticket = mapTicket(data);
        setData((current) => ({ ...current, tickets: [ticket, ...current.tickets] }));
        return ticket;
    };

    const updateTicketStatus = async (ticketId, isSolved) => {
        ensureConnected();
        const { data: ticket } = await apiClient.patch(`/maintenance/${ticketId}/status`, null, { params: { isSolved } });
        const mappedTicket = mapTicket(ticket);
        setData((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === ticketId ? mappedTicket : item) }));
    };

    const value = {
        ...data,
        connectionStatus,
        connectionError,
        refreshData,
        createUnit,
        createResident,
        updateResident,
        createLease,
        cancelLease,
        createTicket,
        updateTicketStatus,
    };

    return <RentalDataContext.Provider value={value}>{children}</RentalDataContext.Provider>;
}

export function useRentalData() {
    const context = useContext(RentalDataContext);
    if (!context) throw new Error("useRentalData must be used inside RentalDataProvider.");
    return context;
}

import React from "react";
import Sidebar from './components/Sidebar'
import MainContent from "./components/MainContent";
import Unitpage from "./pages/Unitpage";
import MaintenancePage from "./pages/MaintenancePage";
import ResidentsPage from "./pages/ResidentsPage";
import Dashboardpage from "./pages/Dashboardpage";
import { RentalDataProvider, useRentalData } from "./state/RentalDataContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function BackendConnectionNotice() {
  const { connectionStatus, connectionError, refreshData } = useRentalData();
  if (connectionStatus === "connected") {
    return <div role="status" className="mb-5 border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900">Connected to the rental backend · Changes are saved to the database.</div>;
  }

  if (connectionStatus === "loading") {
    return <div role="status" className="mb-5 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Connecting to the rental backend…</div>;
  }

  return (
    <div role="alert" className="mb-5 flex flex-col justify-between gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 sm:flex-row sm:items-center">
      <div><strong className="font-semibold">Backend unavailable.</strong> {connectionError}</div>
      <button type="button" onClick={refreshData} className="shrink-0 font-semibold underline underline-offset-2">Retry connection</button>
    </div>
  );
}

export default function DeskApp(){
return(
    <BrowserRouter>
    <RentalDataProvider>
    <Sidebar/>
    <MainContent>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboardpage />} />
        <Route path="/units" element={<Unitpage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/leases" element={<Navigate to="/residents?view=leases" replace />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainContent>
    </RentalDataProvider>
    </BrowserRouter>
)

}
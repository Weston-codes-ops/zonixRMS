import React from "react";
import PageFooter from "./layout/PageFooter";

export default function MainContent({ children }) {
  return (
    // ml-64 matches the sidebar width to prevent overlap
    <main className="ml-64 flex min-h-screen min-w-0 flex-1 flex-col bg-slate-50 p-5 md:p-6">
      <section className="flex min-h-[calc(100vh-2.5rem)] flex-1 flex-col border border-slate-200 bg-white p-5 shadow-sm md:min-h-[calc(100vh-3rem)] md:p-8">
        <div className="flex-1">{children}</div>
        <PageFooter />
      </section>

    </main>
  );
}
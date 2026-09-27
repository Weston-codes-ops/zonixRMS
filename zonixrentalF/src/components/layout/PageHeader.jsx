import React from "react";
import { useLocation } from "react-router-dom";
import { getPageContent } from "../../config/pageContent";

export default function PageHeader({ children }) {
    const { pathname } = useLocation();
    const { eyebrow, title, description } = getPageContent(pathname);

    return (
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
            </div>
            {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
        </header>
    );
}
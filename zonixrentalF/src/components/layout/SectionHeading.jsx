import React from "react";

export default function SectionHeading({ id, icon: Icon, title, description, children }) {
    return (
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={17} className="text-emerald-700" aria-hidden="true" />}
                    <h2 id={id} className="text-lg font-semibold text-slate-950">{title}</h2>
                </div>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {children && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>}
        </div>
    );
}
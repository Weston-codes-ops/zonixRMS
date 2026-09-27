const pageContent = {
    "/dashboard": {
        title: "Dashboard",
        description: "A real-time overview of units, residents, leases, and maintenance workflows",
    },
    "/units": {
        title: "Units",
        description: "Keep track of your apartments, availability, and occupancy in one place.",
    },
    "/residents": {
        title: "Residents",
        description: "Manage resident contacts, tenancy assignments, and WhatsApp communication preferences.",
    },
    "/maintenance": {
        title: "Maintenance",
        description: "Review repair requests, follow progress, and keep every ticket moving.",
    },
};

export function getPageContent(pathname) {
    return pageContent[pathname] || pageContent["/dashboard"];
}
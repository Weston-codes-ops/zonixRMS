import { Home, Boxes, Wrench, Users, Settings, BanknoteArrowUp } from "lucide-react";

export const sidebarItems = [
{
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home
},
{
    title: 'Units',
    path: '/units',
    icon: Boxes
},
{
    title: 'Residents',
    path: '/residents',
    icon: Users
},
{
    title: 'Maintenance',
    path: '/maintenance',
    icon: Wrench

},
{
    title: 'Payments',
    path: '/payments',
    icon: BanknoteArrowUp
},
{
    title: 'Settings',
    path: '/settings',
    icon: Settings
}
]
import React from "react"
import {useLocation, Link} from 'react-router-dom'
import { sidebarItems } from "./compconfig/Sidebarconfig"


export default function Sidebar(){
    const location = useLocation();
return (

<aside className="fixed inset-y-0 left-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-800 text-slate-400">
<div className="flex h-16 items-center px-6 border-b border-slate-800 text-white font-semibold text-lg tracking-wide">
        <img src="/zonix.svg" alt="Zonix RMS logo" className="h-60 w-auto max-w-full" />
      </div>

{/**Navigation Links */}
<nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto mt-16">
    {sidebarItems.map((item,index)=>{
        const isActive = location.pathname == item.path;
        const IconComponent = item.icon;

     return(
        <Link
        key={index}
        to={item.path}
        className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200
        ${isActive 
                ?'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'hover:bg-slate-800 hover:text-slate-100'
        }`}
        >
          
          {/* Icon */}
            <IconComponent
            className={`h-5 w-5 transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}
                `} 
            />

            {/* Link text */}
            <span>{item.title}</span>
        </Link>
     );
    })}
</nav>

 <footer className="w-full border-t border-slate-800 py-4 px-4">
      <p className="text-xs text-slate-500 text-center">
        Copyright &copy; {new Date().getFullYear()} ZonixRMS. All rights reserved.
      </p>
    </footer>

</aside>

)
}
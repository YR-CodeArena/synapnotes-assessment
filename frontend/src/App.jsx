import { NavLink, Outlet } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, ListChecks, Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#0A0D14] dark:text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <nav className="sticky bottom-0 grid grid-cols-4 gap-1 border-t border-slate-200 bg-white/90 p-2 backdrop-blur md:hidden dark:border-slate-800 dark:bg-[#111622]/90">
        <NavLink to="/" end className="grid place-items-center py-2 text-[11px]">
          <LayoutDashboard size={16} />
          Home
        </NavLink>
        <NavLink to="/meetings" className="grid place-items-center py-2 text-[11px]">
          <BrainCircuit size={16} />
          Meetings
        </NavLink>
        <NavLink to="/actions" className="grid place-items-center py-2 text-[11px]">
          <ListChecks size={16} />
          Actions
        </NavLink>
        <NavLink to="/meetings/new" className="grid place-items-center py-2 text-[11px]">
          <Plus size={16} />
          New
        </NavLink>
      </nav>
      <Footer />
    </div>
  );
}

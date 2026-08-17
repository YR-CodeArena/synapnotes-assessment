import { NavLink, useNavigate } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, ListChecks, LogOut, Moon, Plus, Sun, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMeetings } from "../context/MeetingContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "Meetings", icon: BrainCircuit },
  { to: "/actions", label: "Action Tracker", icon: ListChecks },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { openActionCount } = useMeetings();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-glass backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#111622]/80">
        <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
            <BrainCircuit size={18} />
          </span>
          <span className="text-left">
            <span className="block text-sm font-extrabold tracking-tight">SynapNotes AI</span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">Meeting intelligence</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
                {link.to === "/actions" && openActionCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {openActionCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink to="/meetings/new" className="sn-btn-primary hidden sm:inline-flex">
            <Plus size={16} />
            New Meeting
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-[#0A0D14] dark:text-amber-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 dark:border-slate-700 sm:flex">
            <UserRound size={16} className="text-violet-500" />
            <div className="leading-tight">
              <p className="text-xs font-semibold">{user?.full_name}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{isAdmin ? "Team Lead" : "Member"}</p>
            </div>
            <button type="button" onClick={logout} className="ml-1 text-slate-400 hover:text-rose-500" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

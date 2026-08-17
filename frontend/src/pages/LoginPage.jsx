import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BrainCircuit, Sparkles } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const { login, register, isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        await login(form.email, form.password);
      } else {
        await register({ email: form.email, password: form.password, full_name: form.full_name, role: "member" });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const demo = async (email, password) => {
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || "Demo login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0D14]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.25),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_35%)]" />
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-[#111622] dark:text-amber-300"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div className="hidden lg:flex lg:flex-col lg:justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
              <BrainCircuit />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">SynapNotes AI</h1>
            <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
              Turn messy meeting transcripts into executive summaries, decisions, risks, and a living action tracker.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-500">
              <li>• Gemini-powered extraction with mock fallback</li>
              <li>• Kanban + table action tracking</li>
              <li>• Role-aware workspaces for leads and members</li>
            </ul>
          </div>
          <div className="sn-card mx-auto w-full max-w-md border-white/50 bg-white/80 p-6 backdrop-blur-xl dark:bg-[#111622]/90">
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
              {["signin", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === item ? "bg-white shadow dark:bg-slate-800" : ""}`}
                  onClick={() => setMode(item)}
                >
                  {item === "signin" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
            <form className="space-y-3" onSubmit={submit}>
              {mode === "register" && (
                <input
                  className="sn-input"
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  required
                />
              )}
              <input
                className="sn-input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              <input
                className="sn-input"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                minLength={8}
              />
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button type="submit" className="sn-btn-primary w-full" disabled={busy}>
                {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">1-Click Quick Demo Login</p>
              <button type="button" className="sn-btn-ghost w-full" onClick={() => demo("admin@zignuts.com", "adminpass123")} disabled={busy}>
                <Sparkles size={16} className="text-violet-500" />
                Login as Team Lead
              </button>
              <button type="button" className="sn-btn-ghost w-full" onClick={() => demo("member@zignuts.com", "memberpass123")} disabled={busy}>
                Login as Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

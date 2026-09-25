import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Review from "./pages/Review";
import Variances from "./pages/Variances";
import Analyst from "./pages/Analyst";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Review", to: "/review" },
  { label: "Variances", to: "/variances" },
  { label: "AI Analyst", to: "/analyst" },
];

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="text-xl font-black tracking-[0.22em] text-indigo-600">
              FINZ
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {navItems.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/review" element={<Review />} />
            <Route path="/variances" element={<Variances />} />
            <Route path="/analyst" element={<Analyst />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;

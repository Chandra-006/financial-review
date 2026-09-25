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

import "./index.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">

        <nav className="app-nav">

          <div className="app-brand">
            FINZ
          </div>

          <div className="app-links">

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/review"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Review
            </NavLink>

           <NavLink
              to="/variances"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Variances
            </NavLink>

          </div>

        </nav>

        <main>
          <Routes>

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/review"
              element={<Review />}
            />

            <Route
              path="/variances"
              element={<Variances />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
};

export default App;
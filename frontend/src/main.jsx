/**
 * Frontend bootstrap file.
 *
 * This is the entry point that mounts the React app into the DOM and applies the
 * base stylesheet before the application shell loads.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Mount the application inside the root element defined in index.html.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

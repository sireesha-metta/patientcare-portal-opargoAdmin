import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

/**
 * Standalone bootstrap (npm start on :3005).
 * When loaded inside the shell, shell already provides BrowserRouter —
 * only this entry wraps App with a router for local development.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

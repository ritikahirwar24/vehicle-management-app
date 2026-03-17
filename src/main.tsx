import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDefaultData } from "./lib/storage";

// Seed default data on very first load (no-op if data already exists)
initializeDefaultData();

createRoot(document.getElementById("root")!).render(<App />);

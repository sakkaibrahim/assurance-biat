import React from "react";
import { createRoot } from "react-dom/client";
import BriefingApp from "./BriefingApp";
import "./styles.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(<BriefingApp />);

import React from "react";
import ReactDOM from "react-dom/client";   // React 18 createRoot API
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

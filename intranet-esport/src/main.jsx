import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
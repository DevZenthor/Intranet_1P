import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "fr"
  );

  function toggleLang() {
    const newLang = lang === "fr" ? "en" : "fr";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
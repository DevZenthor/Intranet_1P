import React from "react";
import { useLang } from "../context/LanguageContext";
import "../styles/langtoggle.css";

import frFlag from "../assets/fr.png";
import ukFlag from "../assets/uk.png";

function LangToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <button className="lang-toggle" onClick={toggleLang} title="Changer la langue">
      <img
        src={lang === "fr" ? ukFlag : frFlag}
        alt={lang === "fr" ? "English" : "Français"}
        className="lang-flag"
      />
    </button>
  );
}

export default LangToggle;
import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import "../styles/notfound.css";

function NotFound() {
  const { lang } = useLang();

  return (
    <section className="notfound-page">
      <div className="notfound-particles" />
      <div className="notfound-container">

        <div className="notfound-code">404</div>
        <h1 className="notfound-title">
          {lang === "fr" ? "Page introuvable" : "Page not found"}
        </h1>
        <p className="notfound-sub">
          {lang === "fr"
            ? "La page que tu cherches n'existe pas ou a été déplacée."
            : "The page you're looking for doesn't exist or has been moved."
          }
        </p>

        <Link to="/" className="notfound-btn">
          {lang === "fr" ? "← Retour à l'accueil" : "← Back to home"}
        </Link>

      </div>
    </section>
  );
}

export default NotFound;
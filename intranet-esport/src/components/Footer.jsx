import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/footer.css";

function Footer() {
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canSeeMembers  = user && ["admin", "CEO", "Director", "Manager", "Coach"].includes(user.role);
  const canSeeDocs     = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeContent  = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
  const canSeeServices = user && ["admin", "CEO", "Director"].includes(user.role);

  return (
    <footer className="footer">
      <div className="footer-glow" />

      <div className="footer-container">

        {/* TOP */}
        <div className="footer-top">

          {/* BRAND */}
          <div className="footer-brand-col">
            <span className="footer-logo">One Prodige</span>
            <p className="footer-desc">
              {lang === "fr"
                ? "Plateforme intranet officielle de l'équipe esport One Prodige. Gestion centralisée du roster, des performances et du contenu."
                : "Official intranet platform of the One Prodige esport team. Centralized management of roster, performances and content."
              }
            </p>
            <div className="footer-dev">
              {lang === "fr" ? "Développé par" : "Developed by"} <span>Zenthor</span>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="footer-nav-col">
            <h5 className="footer-nav-title">Navigation</h5>
            <div className="footer-links">
              <Link to="/" className="footer-link">{t.nav_accueil}</Link>
              {canSeeMembers && <Link to="/equipe"    className="footer-link">{t.nav_equipe}</Link>}
              {canSeeMembers && <Link to="/annonces"  className="footer-link">{t.nav_annonces}</Link>}
              {canSeeDocs    && <Link to="/documents" className="footer-link">{t.nav_documents}</Link>}
            </div>
          </div>

          {/* FORTNITE */}
          {canSeeDocs && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">{t.nav_fortnite}</h5>
              <div className="footer-links">
                <Link to="/scouting"     className="footer-link">{t.nav_scouting}</Link>
                <Link to="/performances" className="footer-link">{t.nav_performances}</Link>
                <Link to="/joueurs"      className="footer-link">{t.nav_joueurs}</Link>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {canSeeContent && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">{t.nav_content}</h5>
              <div className="footer-links">
                <Link to="/creators" className="footer-link">{t.nav_creators}</Link>
                <Link to="/videos"   className="footer-link">{t.nav_videos}</Link>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {canSeeServices && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">{t.nav_services}</h5>
              <div className="footer-links">
                <Link to="/compta" className="footer-link">{t.nav_compta}</Link>
              </div>
            </div>
          )}

        </div>

        {/* DIVIDER */}
        <div className="footer-divider" />

        {/* BOTTOM */}
        <div className="footer-bottom">
          <span className="footer-copy">
            {lang === "fr"
              ? "© 2026 One Prodige — Tous droits réservés"
              : "© 2026 One Prodige — All rights reserved"
            }
          </span>
          <span className="footer-badge">
            {lang === "fr" ? "Intranet Privé" : "Private Intranet"}
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
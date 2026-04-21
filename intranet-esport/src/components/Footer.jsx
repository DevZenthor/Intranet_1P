import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canSeeMembers  = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
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
              Plateforme intranet officielle de l'équipe esport One Prodige.
              Gestion centralisée du roster, des performances et du contenu.
            </p>
            <div className="footer-dev">
              Développé par <span>Zenthor</span>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="footer-nav-col">
            <h5 className="footer-nav-title">Navigation</h5>
            <div className="footer-links">
              <Link to="/" className="footer-link">Accueil</Link>
              {canSeeMembers && <Link to="/equipe"    className="footer-link">Équipe</Link>}
              {canSeeMembers && <Link to="/annonces"  className="footer-link">Annonces</Link>}
              {canSeeDocs    && <Link to="/documents" className="footer-link">Documents</Link>}
            </div>
          </div>

          {/* FORTNITE */}
          {canSeeDocs && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">Fortnite</h5>
              <div className="footer-links">
                <Link to="/scouting"     className="footer-link">Scouting</Link>
                <Link to="/performances" className="footer-link">Performances</Link>
                <Link to="/joueurs"      className="footer-link">Joueurs</Link>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {canSeeContent && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">Content</h5>
              <div className="footer-links">
                <Link to="/creators" className="footer-link">Creators</Link>
                <Link to="/videos"   className="footer-link">Vidéos</Link>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {canSeeServices && (
            <div className="footer-nav-col">
              <h5 className="footer-nav-title">1P Services</h5>
              <div className="footer-links">
                <Link to="/compta" className="footer-link">Comptabilité</Link>
              </div>
            </div>
          )}

        </div>

        {/* DIVIDER */}
        <div className="footer-divider" />

        {/* BOTTOM */}
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 One Prodige — Tous droits réservés</span>
          <span className="footer-badge">Intranet Privé</span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
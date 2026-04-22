import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import LangToggle from "./LangToggle";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFortnite, setShowFortnite] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => { loadUser(); }, []);

  function loadUser() {
    const saved = localStorage.getItem("user");
    setUser(saved ? JSON.parse(saved) : null);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  }

  const canSeeMembers  = user && ["admin", "CEO", "Director", "Manager", "Coach"].includes(user.role);
  const canSeeDocs     = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeContent  = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
  const canSeeServices = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeFortnite = user && ["admin", "CEO", "Director", "Coach"].includes(user.role);
  const canSeeScouting = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeAnnonces = user && ["admin", "CEO", "Director", "Manager", "Coach"].includes(user.role);

  function closeAll() {
    setShowFortnite(false);
    setShowContent(false);
    setShowServices(false);
  }

  const navLink = (to, label) => (
    <Link to={to} className={location.pathname === to ? "active" : ""} onClick={closeAll}>
      {label}
    </Link>
  );

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">

          <Link to="/" className="navbar-logo">One Prodige</Link>

          <nav className="navbar-menu">
            {navLink("/", t.nav_accueil)}
            {canSeeMembers  && navLink("/equipe",   t.nav_equipe)}
            {canSeeAnnonces && navLink("/annonces", t.nav_annonces)}

            {canSeeFortnite && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/scouting", "/performances", "/joueurs"].includes(location.pathname) ? "active-toggle" : ""}`}
                  onClick={() => { setShowFortnite(!showFortnite); setShowContent(false); setShowServices(false); }}
                >
                  {t.nav_fortnite} ▾
                </button>
                {showFortnite && (
                  <div className="fortnite-dropdown">
                    {canSeeScouting && <Link to="/scouting"     onClick={closeAll}>{t.nav_scouting}</Link>}
                    <Link to="/performances" onClick={closeAll}>{t.nav_performances}</Link>
                    <Link to="/joueurs"      onClick={closeAll}>{t.nav_joueurs}</Link>
                  </div>
                )}
              </div>
            )}

            {canSeeContent && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/creators", "/videos"].includes(location.pathname) ? "active-toggle" : ""}`}
                  onClick={() => { setShowContent(!showContent); setShowFortnite(false); setShowServices(false); }}
                >
                  {t.nav_content} ▾
                </button>
                {showContent && (
                  <div className="fortnite-dropdown">
                    <Link to="/creators" onClick={closeAll}>{t.nav_creators}</Link>
                    <Link to="/videos"   onClick={closeAll}>{t.nav_videos}</Link>
                  </div>
                )}
              </div>
            )}

            {canSeeServices && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/compta"].includes(location.pathname) ? "active-toggle" : ""}`}
                  onClick={() => { setShowServices(!showServices); setShowFortnite(false); setShowContent(false); }}
                >
                  {t.nav_services} ▾
                </button>
                {showServices && (
                  <div className="fortnite-dropdown">
                    <Link to="/compta" onClick={closeAll}>{t.nav_compta}</Link>
                  </div>
                )}
              </div>
            )}

            {canSeeDocs && navLink("/documents", t.nav_documents)}
          </nav>

          <div className="navbar-right">
            {user ? (
              <>
                <LangToggle />
                <div className="navbar-avatar" onClick={() => navigate("/profil")} title={user.pseudo}>
                  {user.pseudo?.charAt(0).toUpperCase()}
                </div>
                <button type="button" className="logout-btn" onClick={logout}>{t.nav_logout}</button>
              </>
            ) : (
              <>
                <LangToggle />
                <button type="button" className="login-btn" onClick={() => setShowModal(true)}>{t.nav_connexion}</button>
              </>
            )}
          </div>

        </div>
      </header>

      {showModal && (
        <LoginModal
          closeModal={() => setShowModal(false)}
          onLoginSuccess={() => { loadUser(); setShowModal(false); window.location.reload(); }}
        />
      )}
    </>
  );
}

export default Navbar;
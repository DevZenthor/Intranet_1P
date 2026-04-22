import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import LangToggle from "./LangToggle";
import NotifBell from "./NotifBell";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFortnite, setShowFortnite] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showWebtv, setShowWebtv] = useState(false);
  const [showGestion, setShowGestion] = useState(false);
  const [showEquipe, setShowEquipe] = useState(false);
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

  const canSeeDashboard = user && ["admin", "CEO"].includes(user.role);
  const canSeeMembers = user && ["admin", "CEO", "Director", "Manager", "Coach"].includes(user.role);
  const canSeeDocs = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeContent = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
  const canSeeServices = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeFortnite = user && ["admin", "CEO", "Director", "Coach"].includes(user.role);
  const canSeeScouting = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeAnnonces = user && ["admin", "CEO", "Director", "Manager", "Coach"].includes(user.role);
  const canSeeWebtv = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);



  function closeAll() {
    setShowFortnite(false);
    setShowContent(false);
    setShowServices(false);
    setShowWebtv(false);
    setShowGestion(false);
    setShowEquipe(false);
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={location.pathname === to ? "active" : ""}
      onClick={closeAll}
    >
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
            {/* ÉQUIPE — Équipe + Annonces */}
            {canSeeMembers && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/equipe", "/annonces"].includes(location.pathname) ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowEquipe(!showEquipe); setShowFortnite(false); setShowContent(false); setShowServices(false); setShowWebtv(false); }}
                >
                  {lang === "fr" ? "Équipe" : "Team"} ▾
                </button>
                {showEquipe && (
                  <div className="fortnite-dropdown">
                    <Link to="/equipe" onClick={closeAll}>{t.nav_equipe}</Link>
                    {canSeeAnnonces && <Link to="/annonces" onClick={closeAll}>{t.nav_annonces}</Link>}
                  </div>
                )}
              </div>
            )}

            {/* FORTNITE */}
            {canSeeFortnite && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/scouting", "/performances", "/joueurs"].includes(location.pathname)
                    ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowFortnite(!showFortnite); setShowContent(false); setShowServices(false); setShowWebtv(false); }}
                >
                  {t.nav_fortnite} ▾
                </button>
                {showFortnite && (
                  <div className="fortnite-dropdown">
                    {canSeeScouting && <Link to="/scouting" onClick={closeAll}>{t.nav_scouting}</Link>}
                    <Link to="/performances" onClick={closeAll}>{t.nav_performances}</Link>
                    <Link to="/joueurs" onClick={closeAll}>{t.nav_joueurs}</Link>
                  </div>
                )}
              </div>
            )}

            {/* CONTENT */}
            {canSeeContent && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/creators", "/videos"].includes(location.pathname)
                    ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowContent(!showContent); setShowFortnite(false); setShowServices(false); setShowWebtv(false); }}
                >
                  {t.nav_content} ▾
                </button>
                {showContent && (
                  <div className="fortnite-dropdown">
                    <Link to="/creators" onClick={closeAll}>{t.nav_creators}</Link>
                    <Link to="/videos" onClick={closeAll}>{t.nav_videos}</Link>
                  </div>
                )}
              </div>
            )}

            {/* WEBTV */}
            {canSeeWebtv && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/planning"].includes(location.pathname)
                    ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowWebtv(!showWebtv); setShowFortnite(false); setShowContent(false); setShowServices(false); }}
                >
                  WebTV ▾
                </button>
                {showWebtv && (
                  <div className="fortnite-dropdown">
                    <Link to="/planning" onClick={closeAll}>
                      {lang === "fr" ? "Planning" : "Schedule"}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 1P SERVICES */}
            {canSeeServices && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/compta"].includes(location.pathname)
                    ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowServices(!showServices); setShowFortnite(false); setShowContent(false); setShowWebtv(false); }}
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

            {/* GESTION — Dashboard + Documents */}
            {canSeeDashboard && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${["/dashboard", "/documents"].includes(location.pathname) ? "active-toggle" : ""
                    }`}
                  onClick={() => { setShowGestion(!showGestion); setShowFortnite(false); setShowContent(false); setShowServices(false); setShowWebtv(false); }}
                >
                  {lang === "fr" ? "Gestion" : "Admin"} ▾
                </button>
                {showGestion && (
                  <div className="fortnite-dropdown">
                    <Link to="/dashboard" onClick={closeAll}>Dashboard</Link>
                    {canSeeDocs && <Link to="/documents" onClick={closeAll}>{t.nav_documents}</Link>}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="navbar-right">
            {user ? (
              <>
                <LangToggle />
                <NotifBell />
                <div
                  className="navbar-avatar"
                  onClick={() => navigate("/profil")}
                  title={user.pseudo}
                >
                  {user.pseudo?.charAt(0).toUpperCase()}
                </div>
                <button type="button" className="logout-btn" onClick={logout}>
                  {t.nav_logout}
                </button>
              </>
            ) : (
              <>
                <LangToggle />
                <button type="button" className="login-btn" onClick={() => setShowModal(true)}>
                  {t.nav_connexion}
                </button>
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
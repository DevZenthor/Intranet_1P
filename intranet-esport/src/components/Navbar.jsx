import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";
import "../styles/navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFortnite, setShowFortnite] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const location = useLocation();

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

  const canSeeMembers  = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
  const canSeeDocs     = user && ["admin", "CEO", "Director"].includes(user.role);
  const canSeeContent  = user && ["admin", "CEO", "Director", "Manager"].includes(user.role);
  const canSeeServices = user && ["admin", "CEO", "Director"].includes(user.role);

  function closeAll() {
    setShowFortnite(false);
    setShowContent(false);
    setShowServices(false);
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

          <Link to="/" className="navbar-logo">
            One Prodige
          </Link>

          <nav className="navbar-menu">
            {navLink("/", "Accueil")}
            {canSeeMembers && navLink("/equipe", "Équipe")}
            {canSeeMembers && navLink("/annonces", "Annonces")}

            {/* FORTNITE — admin, CEO, Director */}
            {canSeeDocs && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${
                    ["/scouting", "/performances", "/joueurs"].includes(location.pathname)
                      ? "active-toggle" : ""
                  }`}
                  onClick={() => {
                    setShowFortnite(!showFortnite);
                    setShowContent(false);
                    setShowServices(false);
                  }}
                >
                  Fortnite ▾
                </button>

                {showFortnite && (
                  <div className="fortnite-dropdown">
                    <Link to="/scouting"     onClick={closeAll}>Scouting</Link>
                    <Link to="/performances" onClick={closeAll}>Performances</Link>
                    <Link to="/joueurs"      onClick={closeAll}>Joueurs</Link>
                  </div>
                )}
              </div>
            )}

            {/* CONTENT — admin, CEO, Director, Manager */}
            {canSeeContent && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${
                    ["/creators", "/videos"].includes(location.pathname)
                      ? "active-toggle" : ""
                  }`}
                  onClick={() => {
                    setShowContent(!showContent);
                    setShowFortnite(false);
                    setShowServices(false);
                  }}
                >
                  Content ▾
                </button>

                {showContent && (
                  <div className="fortnite-dropdown">
                    <Link to="/creators" onClick={closeAll}>Creators</Link>
                    <Link to="/videos"   onClick={closeAll}>Vidéos</Link>
                  </div>
                )}
              </div>
            )}

            {/* 1P SERVICES — admin, CEO, Director */}
            {canSeeServices && (
              <div className="fortnite-menu">
                <button
                  className={`fortnite-toggle ${
                    ["/compta"].includes(location.pathname)
                      ? "active-toggle" : ""
                  }`}
                  onClick={() => {
                    setShowServices(!showServices);
                    setShowFortnite(false);
                    setShowContent(false);
                  }}
                >
                  1P Services ▾
                </button>

                {showServices && (
                  <div className="fortnite-dropdown">
                    <Link to="/compta" onClick={closeAll}>Comptabilité</Link>
                  </div>
                )}
              </div>
            )}

            {canSeeDocs && navLink("/documents", "Documents")}
          </nav>

          <div className="navbar-right">
            {user ? (
              <>
                <span className="navbar-user">Bonjour {user.pseudo}</span>
                <button type="button" className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <button type="button" className="login-btn" onClick={() => setShowModal(true)}>
                Connexion
              </button>
            )}
          </div>

        </div>
      </header>

      {showModal && (
        <LoginModal
          closeModal={() => setShowModal(false)}
          onLoginSuccess={() => {
            loadUser();
            setShowModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default Navbar;
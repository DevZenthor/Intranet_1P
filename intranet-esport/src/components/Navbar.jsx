import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const openLogin = () => {
    window.dispatchEvent(new Event("openLoginModal"));
  };

  const canAccessScouting =
    user &&
    ["admin", "CEO", "Director"].includes(user.role);

  return (
    <nav className="custom-navbar">
      <div className="container nav-content">

        <Link to="/" className="brand">
          One Prodige
        </Link>

        <div className="nav-links">
          <Link to="/">Accueil</Link>

          {user && <Link to="/equipe">Équipe</Link>}

          {canAccessScouting && (
            <Link to="/scouting">Scouting</Link>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="hello-user">
                Bonjour {user.pseudo}
              </span>

              <button
                className="nav-btn"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="nav-btn"
              onClick={openLogin}
            >
              Connexion
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
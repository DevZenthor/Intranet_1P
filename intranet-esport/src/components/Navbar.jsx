import React, { useState } from "react";
import "../styles/navbar.css";

import LoginModal from "./LoginModal";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="custom-navbar navbar navbar-expand-lg">
        <div className="container">

          {/* LOGO */}
          <a href="#" className="navbar-brand">
            One Prodige
          </a>

          {/* MENU */}
          <ul className="navbar-nav mx-auto d-flex flex-row gap-4">

            <li>
              <a className="nav-link" href="#">
                Accueil
              </a>
            </li>

            <li>
              <a className="nav-link" href="#">
                Équipe
              </a>
            </li>

            <li>
              <a className="nav-link" href="#">
                Planning
              </a>
            </li>

            <li>
              <a className="nav-link" href="#">
                Documents
              </a>
            </li>

          </ul>

          {/* RIGHT */}
          <div className="d-flex align-items-center gap-3">

            {user && (
              <span className="user-name">
                Bonjour {user.pseudo}
              </span>
            )}

            {user ? (
              <button
                className="login-btn"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <button
                className="login-btn"
                onClick={() => setOpen(true)}
              >
                Connexion
              </button>
            )}

          </div>

        </div>
      </nav>

      {open && (
        <LoginModal close={() => setOpen(false)} />
      )}
    </>
  );
}

export default Navbar;
import React, { useState } from "react";
import "../styles/navbar.css";

import { Link } from "react-router-dom";

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
          <Link to="/" className="navbar-brand">
            One Prodige
          </Link>

          {/* MENU */}
          <ul className="navbar-nav mx-auto d-flex flex-row gap-4">

            <li className="nav-item">
              <Link to="/" className="nav-link">
                Accueil
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/equipe" className="nav-link">
                Équipe
              </Link>
            </li>

            {/*
            <li className="nav-item">
              <Link to="/planning" className="nav-link">
                Planning
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/documents" className="nav-link">
                Documents
              </Link>
            </li>
            */}

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
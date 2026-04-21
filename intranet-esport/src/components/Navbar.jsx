import React from "react";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="custom-navbar navbar navbar-expand-lg">
      <div className="container">

        <a href="#" className="navbar-brand">
          One Prodige
        </a>

        <button
          className="navbar-toggler text-white"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
        >
          ☰
        </button>

        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav mx-auto">

            <li className="nav-item">
              <a className="nav-link" href="#">Accueil</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#">Équipe</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#">Planning</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#">Documents</a>
            </li>

          </ul>

          <button className="login-btn">
            Connexion
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
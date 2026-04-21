import React from "react";
import "../styles/footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="custom-footer">
      <div className="container">

        <div className="row g-4">

          {/* MARQUE */}
          <div className="col-md-4">
            <h3 className="footer-brand">
              One Prodige
            </h3>

            <p className="footer-text mt-3">
              Intranet officiel de l’équipe One Prodige.
              Plateforme interne premium pour gérer
              l’organisation esport.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="col-md-4">
            <h5 className="footer-title">
              Navigation
            </h5>

            <Link to="/" className="footer-link">
              Accueil
            </Link>

            <Link to="/equipe" className="footer-link">
              Équipe
            </Link>

            {/*
            <Link to="/planning" className="footer-link">
              Planning
            </Link>

            <Link to="/documents" className="footer-link">
              Documents
            </Link>
            */}
          </div>

          {/* COMPTE */}
          <div className="col-md-4">
            <h5 className="footer-title">
              Compte
            </h5>

            <span className="footer-link">
              Connexion
            </span>

            <div className="dev-box">
              Dev by <span>Zenthor</span>
            </div>
          </div>

        </div>

        <div className="copyright text-center">
          © 2026 One Prodige - Tous droits réservés
        </div>

      </div>
    </footer>
  );
}

export default Footer;
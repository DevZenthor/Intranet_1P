import React from "react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="custom-footer">
      <div className="container">

        <div className="row g-4">

          {/* MARQUE */}
          <div className="col-md-4">
            <h3 className="footer-brand">One Prodige</h3>

            <p className="footer-text mt-3">
              Intranet officiel de l'équipe One Prodige.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="col-md-4">
            <h5 className="footer-title">Navigation</h5>

            <a href="#" className="footer-link">Accueil</a>
            <a href="#" className="footer-link">Équipe</a>
            <a href="#" className="footer-link">Planning</a>
            <a href="#" className="footer-link">Documents</a>
          </div>

          {/* COMPTE */}
          <div className="col-md-4">
            <h5 className="footer-title">Compte</h5>

            <a href="#" className="footer-link">Connexion</a>
            <a href="#" className="footer-link">Support</a>

            <div className="dev-box">
              Dev by <span>Zenthor</span>
            </div>
          </div>

        </div>

        <div className="copyright text-center">
          © 2026 One Prodige
        </div>

      </div>
    </footer>
  );
}

export default Footer;
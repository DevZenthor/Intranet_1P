import React, { useEffect } from "react";
import "../styles/home.css";

import AOS from "aos";
import "aos/dist/aos.css";

import {
  FaUsers,
  FaCalendarAlt,
  FaFolderOpen
} from "react-icons/fa";

function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <section className="hero-section">
      <div className="particles"></div>

      <div className="container hero-content">

        <p className="hero-subtitle" data-aos="fade-down">
          BIENVENUE SUR
        </p>

        <h1 className="hero-title glow-text" data-aos="zoom-in">
          INTRANET
        </h1>

        <p className="hero-text" data-aos="fade-up">
          Plateforme premium officielle de l’équipe One Prodige.
          Planning, roster, documents, annonces et statistiques
          centralisés dans un espace moderne.
        </p>

       

        <div className="row mt-5 g-4">

          <div className="col-md-4" data-aos="fade-up">
            <div className="feature-card tilt-card">
              <FaUsers className="feature-icon team-icon" />
              <h3>Équipe</h3>
              <p>Roster, staff et informations internes.</p>
            </div>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="150">
            <div className="feature-card tilt-card">
              <FaCalendarAlt className="feature-icon planning-icon" />
              <h3>Planning</h3>
              <p>planning webtv , planning youtube et  événements.</p>
            </div>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-card tilt-card">
              <FaFolderOpen className="feature-icon doc-icon" />
              <h3>Documents</h3>
              <p>Stratégies, ressources et archives.</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Home;
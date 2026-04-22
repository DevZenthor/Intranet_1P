import React, { useEffect } from "react";
import "../styles/home.css";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";

import AOS from "aos";
import "aos/dist/aos.css";

import { FaUsers, FaCalendarAlt, FaFolderOpen } from "react-icons/fa";

function Home() {
  const { lang } = useLang();
  const t = translations[lang];

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
          {t.home_welcome}
        </p>

        <h1 className="hero-title glow-text" data-aos="zoom-in">
          INTRANET
        </h1>

        <p className="hero-text" data-aos="fade-up">
          {t.home_sub}
        </p>

        <div className="row mt-5 g-4">

          <div className="col-md-4" data-aos="fade-up">
            <div className="feature-card tilt-card">
              <FaUsers className="feature-icon team-icon" />
              <h3>{t.home_equipe}</h3>
              <p>{t.home_equipe_sub}</p>
            </div>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="150">
            <div className="feature-card tilt-card">
              <FaCalendarAlt className="feature-icon planning-icon" />
              <h3>{t.home_planning}</h3>
              <p>{t.home_planning_sub}</p>
            </div>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-card tilt-card">
              <FaFolderOpen className="feature-icon doc-icon" />
              <h3>{t.home_docs}</h3>
              <p>{t.home_docs_sub}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Home;
import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/loginmodal.css";

function LoginModal({ closeModal, onLoginSuccess }) {
  const [pseudo, setPseudo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => setVisible(true), 10);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(closeModal, 220);
  }

  async function login() {
    if (!pseudo.trim() || !code.trim()) {
      setError("Remplis tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("pseudo", pseudo.trim())
      .eq("code", code.trim());

    if (error) {
      setError("Erreur serveur");
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setError("Identifiants invalides");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data[0]));

    if (onLoginSuccess) onLoginSuccess();
  }

  return (
    <div
      className={`login-overlay ${visible ? "login-overlay--in" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`login-box ${visible ? "login-box--in" : ""}`}>

        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <span></span>
          <span></span>
        </button>

        <div className="login-header">
          <div className="login-logo-dot" />
          <h2>Connexion</h2>
          <p>Accès réservé aux membres</p>
        </div>

        <div className="login-fields">
          <div className="login-field">
            <label>Pseudo</label>
            <input
              type="text"
              placeholder="Ton pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label>Code</label>
            <input
              type="password"
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
        </div>

        {error && (
          <p className="login-error">⚠ {error}</p>
        )}

        <button
          className="login-submit-btn"
          onClick={login}
          disabled={loading}
        >
          {loading ? <span className="login-spinner" /> : "Se connecter"}
        </button>

      </div>
    </div>
  );
}

export default LoginModal;
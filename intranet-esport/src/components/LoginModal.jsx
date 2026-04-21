import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/loginmodal.css";

function LoginModal() {
  const [open, setOpen] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openModal = () => setOpen(true);

    window.addEventListener(
      "openLoginModal",
      openModal
    );

    return () =>
      window.removeEventListener(
        "openLoginModal",
        openModal
      );
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");

    const cleanPseudo = pseudo.trim();
    const cleanCode = code.trim();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("pseudo", cleanPseudo)
      .eq("code", cleanCode);

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

    localStorage.setItem(
      "user",
      JSON.stringify(data[0])
    );

    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="login-overlay">
      <div className="login-box">

        <h2>Connexion</h2>

        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) =>
            setPseudo(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
        />

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          className="login-btn"
          onClick={login}
          disabled={loading}
        >
          {loading
            ? "Connexion..."
            : "Se connecter"}
        </button>

        <button
          className="close-btn"
          onClick={() => setOpen(false)}
        >
          Fermer
        </button>

      </div>
    </div>
  );
}

export default LoginModal;
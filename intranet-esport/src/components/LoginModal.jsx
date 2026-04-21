import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

function LoginModal({ close }) {
  const [pseudo, setPseudo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleLogin = async () => {
  setError("");

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("pseudo", pseudo)
    .eq("code", code)
    .single();

  if (data) {
    login(data);
    close();
  } else {
    setError("Identifiants invalides");
    console.log(error);
  }
};

  return (
    <div className="login-overlay">
      <div className="login-box">

        <h2>Connexion</h2>

        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button onClick={handleLogin}>
          Se connecter
        </button>

        <button onClick={close}>
          Fermer
        </button>

      </div>
    </div>
  );
}

export default LoginModal;
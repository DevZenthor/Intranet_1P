import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import { FaCopy, FaCheck, FaPlus, FaTrash } from "react-icons/fa";
import "../styles/streamtitres.css";

function StreamTitres() {
  const [titres, setTitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitre, setNewTitre] = useState("");
  const [copied, setCopied] = useState(null);
  const { lang } = useLang();

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  useEffect(() => { loadTitres(); }, []);

  async function loadTitres() {
    const { data } = await supabase
      .from("stream_titres")
      .select("*")
      .order("created_at", { ascending: false });
    setTitres(data || []);
    setLoading(false);
  }

  async function addTitre() {
    if (!newTitre.trim()) return;
    await supabase.from("stream_titres").insert([{ titre: newTitre.trim() }]);
    setNewTitre("");
    loadTitres();
  }

  async function deleteTitre(id) {
    await supabase.from("stream_titres").delete().eq("id", id);
    loadTitres();
  }

  function copyTitre(titre, id) {
    navigator.clipboard.writeText(titre);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="stream-page">
      <div className="stream-particles" />
      <div className="stream-container">

        <p className="stream-mini">ONE PRODIGE</p>
        <h1 className="stream-title">
          {lang === "fr" ? "Titres de Stream" : "Stream Titles"}
        </h1>
        <p className="stream-sub">
          {lang === "fr"
            ? "Copie un titre en 1 clic pour Twitch"
            : "Copy a title in 1 click for Twitch"}
        </p>

        {/* AJOUTER */}
        {canManage && (
          <div className="stream-add-wrap">
            <input
              type="text"
              className="stream-input"
              placeholder={lang === "fr" ? "Nouveau titre de stream..." : "New stream title..."}
              value={newTitre}
              onChange={(e) => setNewTitre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTitre()}
              maxLength={140}
            />
            <button className="stream-add-btn" onClick={addTitre}>
              <FaPlus /> {lang === "fr" ? "Ajouter" : "Add"}
            </button>
          </div>
        )}

        {/* COMPTEUR */}
        {newTitre && (
          <p className="stream-counter">{newTitre.length}/140</p>
        )}

        {/* LISTE */}
        {loading ? (
          <p className="stream-loading">{lang === "fr" ? "Chargement..." : "Loading..."}</p>
        ) : titres.length === 0 ? (
          <p className="stream-empty">
            {lang === "fr" ? "Aucun titre pour l'instant." : "No titles yet."}
          </p>
        ) : (
          <div className="stream-list">
            {titres.map((t) => (
              <div key={t.id} className="stream-titre-card">
                <p className="stream-titre-text">{t.titre}</p>
                <div className="stream-titre-actions">
                  <button
                    className={`stream-copy-btn ${copied === t.id ? "copied" : ""}`}
                    onClick={() => copyTitre(t.titre, t.id)}
                    title={lang === "fr" ? "Copier" : "Copy"}
                  >
                    {copied === t.id ? <FaCheck /> : <FaCopy />}
                    {copied === t.id
                      ? (lang === "fr" ? "Copié !" : "Copied!")
                      : (lang === "fr" ? "Copier" : "Copy")}
                  </button>
                  {canManage && (
                    <button
                      className="stream-delete-btn"
                      onClick={() => deleteTitre(t.id)}
                      title={lang === "fr" ? "Supprimer" : "Delete"}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default StreamTitres;
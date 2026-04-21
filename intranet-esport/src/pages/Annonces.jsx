import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/annonces.css";

const TYPES = ["Annonce", "Recrue", "Leave"];

const typeConfig = {
  "Recrue":  { color: "type-recrue",  icon: "✅", label: "Recrue"  },
  "Leave":   { color: "type-leave",   icon: "👋", label: "Leave"   },
  "Annonce": { color: "type-annonce", icon: "📢", label: "Annonce" },
};

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [deleteAnnonce, setDeleteAnnonce] = useState(null);
  const [filterType, setFilterType] = useState("tous");

  const user      = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { titre: "", contenu: "", type: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadAnnonces(); }, []);

  async function loadAnnonces() {
    const { data } = await supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnonces(data || []);
    setLoading(false);
  }

  async function addAnnonce() {
    if (!form.titre || !form.type) { alert("Titre et type requis"); return; }
    await supabase.from("annonces").insert([{
      ...form,
      auteur: user?.pseudo,
    }]);
    setShowAdd(false);
    setForm(emptyForm);
    loadAnnonces();
  }

  async function confirmDelete() {
    await supabase.from("annonces").delete().eq("id", deleteAnnonce.id);
    setDeleteAnnonce(null);
    loadAnnonces();
  }

  function formatDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  }

  const filtered = annonces.filter(a =>
    filterType === "tous" || a.type === filterType
  );

  const nbRecrues  = annonces.filter(a => a.type === "Recrue").length;
  const nbLeaves   = annonces.filter(a => a.type === "Leave").length;
  const nbAnnonces = annonces.filter(a => a.type === "Annonce").length;

  return (
    <section className="annonces-page">
      <div className="annonces-particles" />

      <div className="annonces-container">

        <p className="annonces-mini">ONE PRODIGE</p>
        <h1 className="annonces-title">Annonces</h1>
        <p className="annonces-sub">Actualités et mouvements de la structure</p>

        {/* STATS */}
        <div className="annonces-stats">
          <div className="annonces-stat-card">
            <span className="annonces-stat-icon">📢</span>
            <span className="annonces-stat-label">Annonces</span>
            <span className="annonces-stat-value">{nbAnnonces}</span>
          </div>
          <div className="annonces-stat-card annonces-stat-card--recrue">
            <span className="annonces-stat-icon">✅</span>
            <span className="annonces-stat-label">Recrues</span>
            <span className="annonces-stat-value">{nbRecrues}</span>
          </div>
          <div className="annonces-stat-card annonces-stat-card--leave">
            <span className="annonces-stat-icon">👋</span>
            <span className="annonces-stat-label">Leaves</span>
            <span className="annonces-stat-value">{nbLeaves}</span>
          </div>
          <div className="annonces-stat-card">
            <span className="annonces-stat-icon">📋</span>
            <span className="annonces-stat-label">Total</span>
            <span className="annonces-stat-value">{annonces.length}</span>
          </div>
        </div>

        {/* FILTRES + BOUTON */}
        <div className="annonces-filters">
          {["tous", ...TYPES].map(t => (
            <button
              key={t}
              className={`annonces-filter-btn ${filterType === t ? "active" : ""}`}
              onClick={() => setFilterType(t)}
            >
              {t === "tous" ? "Tous" : t}
            </button>
          ))}

          {canManage && (
            <button
              className="annonces-add-btn"
              onClick={() => { setForm(emptyForm); setShowAdd(true); }}
            >
              + Publier
            </button>
          )}
        </div>

        {/* CARDS */}
        {loading ? (
          <p className="annonces-loading">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="annonces-empty">Aucune annonce pour le moment.</p>
        ) : (
          <div className="annonces-grid">
            {filtered.map((a) => {
              const cfg = typeConfig[a.type] || typeConfig["Annonce"];
              return (
                <div key={a.id} className={`annonce-card ${cfg.color}`}>

                  <div className="annonce-card-top">
                    <div className="annonce-type-badge">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </div>
                    <span className="annonce-date">{formatDate(a.created_at)}</span>
                  </div>

                  <h3 className="annonce-titre">{a.titre}</h3>

                  {a.contenu && (
                    <p className="annonce-contenu">{a.contenu}</p>
                  )}

                  <div className="annonce-footer">
                    <span className="annonce-auteur">Par {a.auteur || "—"}</span>
                    {canManage && (
                      <button
                        className="annonce-delete-btn"
                        onClick={() => setDeleteAnnonce(a)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP AJOUTER */}
      {showAdd && (
        <div className="annonces-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="annonces-popup">
            <h2>Publier une annonce</h2>

            <div className="popup-fields">
              <select
                className="popup-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Type d'annonce</option>
                {TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
              />

              <textarea
                placeholder="Contenu (optionnel)"
                value={form.contenu}
                onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                rows={4}
              />
            </div>

            <button className="popup-save" onClick={addAnnonce}>Publier</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deleteAnnonce && (
        <div className="annonces-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteAnnonce(null)}>
          <div className="annonces-popup annonces-popup--delete">
            <h2>Supprimer l'annonce ?</h2>
            <p>Cette action est irréversible.<br /><strong>{deleteAnnonce.titre}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>Oui supprimer</button>
            <button className="popup-close" onClick={() => setDeleteAnnonce(null)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Annonces;
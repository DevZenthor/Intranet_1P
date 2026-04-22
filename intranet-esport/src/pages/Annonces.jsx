import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/annonces.css";

const TYPES_FR = ["Annonce", "Recrue", "Leave"];
const TYPES_EN = ["Announcement", "Signing", "Leave"];

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [deleteAnnonce, setDeleteAnnonce] = useState(null);
  const [filterType, setFilterType] = useState("tous");
  const { lang } = useLang();
  const t = translations[lang];

  const user      = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { titre: "", contenu: "", type: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadAnnonces(); }, []);

  async function loadAnnonces() {
    const { data } = await supabase.from("annonces").select("*").order("created_at", { ascending: false });
    setAnnonces(data || []);
    setLoading(false);
  }

  async function addAnnonce() {
    if (!form.titre || !form.type) { alert("Titre et type requis"); return; }
    await supabase.from("annonces").insert([{ ...form, auteur: user?.pseudo }]);
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
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }

  const typeConfig = {
    "Annonce":      { color: "type-annonce", icon: "📢", label: lang === "fr" ? "Annonce"      : "Announcement" },
    "Recrue":       { color: "type-recrue",  icon: "✅", label: lang === "fr" ? "Recrue"       : "Signing"      },
    "Leave":        { color: "type-leave",   icon: "👋", label: "Leave" },
    "Announcement": { color: "type-annonce", icon: "📢", label: "Announcement" },
    "Signing":      { color: "type-recrue",  icon: "✅", label: "Signing"      },
  };

  const TYPES = lang === "fr" ? TYPES_FR : TYPES_EN;

  const filtered = annonces.filter(a => filterType === "tous" || a.type === filterType);
  const nbRecrues  = annonces.filter(a => a.type === "Recrue"  || a.type === "Signing").length;
  const nbLeaves   = annonces.filter(a => a.type === "Leave").length;
  const nbAnnonces = annonces.filter(a => a.type === "Annonce" || a.type === "Announcement").length;

  return (
    <section className="annonces-page">
      <div className="annonces-particles" />
      <div className="annonces-container">

        <p className="annonces-mini">{t.annonces_mini}</p>
        <h1 className="annonces-title">{t.annonces_title}</h1>
        <p className="annonces-sub">{t.annonces_sub}</p>

        <div className="annonces-stats">
          <div className="annonces-stat-card">
            <span className="annonces-stat-icon">📢</span>
            <span className="annonces-stat-label">{t.annonces_title}</span>
            <span className="annonces-stat-value">{nbAnnonces}</span>
          </div>
          <div className="annonces-stat-card annonces-stat-card--recrue">
            <span className="annonces-stat-icon">✅</span>
            <span className="annonces-stat-label">{t.annonces_recrues}</span>
            <span className="annonces-stat-value">{nbRecrues}</span>
          </div>
          <div className="annonces-stat-card annonces-stat-card--leave">
            <span className="annonces-stat-icon">👋</span>
            <span className="annonces-stat-label">{t.annonces_leaves}</span>
            <span className="annonces-stat-value">{nbLeaves}</span>
          </div>
          <div className="annonces-stat-card">
            <span className="annonces-stat-icon">📋</span>
            <span className="annonces-stat-label">{t.annonces_total}</span>
            <span className="annonces-stat-value">{annonces.length}</span>
          </div>
        </div>

        <div className="annonces-filters">
          <button className={`annonces-filter-btn ${filterType === "tous" ? "active" : ""}`} onClick={() => setFilterType("tous")}>
            {t.annonces_tous}
          </button>
          {TYPES.map(type => (
            <button
              key={type}
              className={`annonces-filter-btn ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
          {canManage && (
            <button className="annonces-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
              {t.annonces_publier}
            </button>
          )}
        </div>

        {loading ? (
          <p className="annonces-loading">{t.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="annonces-empty">{t.annonces_empty}</p>
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
                  {a.contenu && <p className="annonce-contenu">{a.contenu}</p>}
                  <div className="annonce-footer">
                    <span className="annonce-auteur">{t.annonces_par} {a.auteur || "—"}</span>
                    {canManage && (
                      <button className="annonce-delete-btn" onClick={() => setDeleteAnnonce(a)}>
                        {t.annonces_sup}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="annonces-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="annonces-popup">
            <h2>{t.annonces_add}</h2>
            <div className="popup-fields">
              <select className="popup-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">{t.annonces_type}</option>
                {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <input type="text" placeholder={t.annonces_titre} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
              <textarea placeholder={t.annonces_contenu} value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={4} />
            </div>
            <button className="popup-save" onClick={addAnnonce}>{t.annonces_pub_btn}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{t.annonces_fermer}</button>
          </div>
        </div>
      )}

      {deleteAnnonce && (
        <div className="annonces-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteAnnonce(null)}>
          <div className="annonces-popup annonces-popup--delete">
            <h2>{t.annonces_confirm}</h2>
            <p>{t.annonces_irrever}<br /><strong>{deleteAnnonce.titre}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{t.annonces_oui}</button>
            <button className="popup-close" onClick={() => setDeleteAnnonce(null)}>{t.annonces_annuler}</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Annonces;
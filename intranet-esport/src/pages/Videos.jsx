import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/videos.css";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCreateur, setFilterCreateur] = useState("tous");
  const [filterType, setFilterType] = useState("tous");
  const [showAdd, setShowAdd] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const [deleteVideo, setDeleteVideo] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    titre: "", date: "", vues: "", createur: "", type: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadVideos();
    loadCreators();
  }, []);

  async function loadVideos() {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("date", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }

  async function loadCreators() {
    const { data } = await supabase
      .from("creators")
      .select("pseudo")
      .order("pseudo", { ascending: true });
    setCreators(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addVideo() {
    if (!form.titre || !form.type) { alert("Titre et type requis"); return; }
    await supabase.from("videos").insert([{
      ...form,
      vues: parseInt(form.vues) || 0,
    }]);
    setShowAdd(false);
    setForm(emptyForm);
    loadVideos();
  }

  async function updateVideo() {
    await supabase.from("videos").update({
      ...form,
      vues: parseInt(form.vues) || 0,
    }).eq("id", editVideo.id);
    setEditVideo(null);
    setForm(emptyForm);
    loadVideos();
  }

  async function confirmDelete() {
    await supabase.from("videos").delete().eq("id", deleteVideo.id);
    setDeleteVideo(null);
    loadVideos();
  }

  function openEdit(v) {
    setForm({
      titre:    v.titre    || "",
      date:     v.date     || "",
      vues:     v.vues     || "",
      createur: v.createur || "",
      type:     v.type     || "",
    });
    setEditVideo(v);
  }

  const filtered = videos.filter(v => {
    const okCreateur = filterCreateur === "tous" || v.createur === filterCreateur;
    const okType     = filterType === "tous"     || v.type === filterType;
    return okCreateur && okType;
  });

  const totalVues   = filtered.reduce((s, v) => s + (v.vues || 0), 0);
  const bestVideo   = filtered.length ? filtered.reduce((a, b) => (a.vues || 0) > (b.vues || 0) ? a : b) : null;
  const nbShorts    = filtered.filter(v => v.type === "Short").length;
  const nbVideos    = filtered.filter(v => v.type === "Vidéo").length;

  return (
    <section className="videos-page">
      <div className="videos-particles" />

      <div className="videos-container">

        <p className="videos-mini">ONE PRODIGE</p>
        <h1 className="videos-title">Vidéos</h1>
        <p className="videos-sub">Suivi du contenu publié</p>

        {/* FILTRES */}
        <div className="videos-filters">
          <select
            className="videos-select"
            value={filterCreateur}
            onChange={(e) => setFilterCreateur(e.target.value)}
          >
            <option value="tous">Tous les creators</option>
            {creators.map(c => (
              <option key={c.pseudo} value={c.pseudo}>{c.pseudo}</option>
            ))}
          </select>

          <select
            className="videos-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="tous">Tous les types</option>
            <option value="Vidéo">Vidéo</option>
            <option value="Short">Short</option>
          </select>

          {canManage && (
            <button className="videos-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
              + Ajouter vidéo
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="videos-stats-grid">
          <div className="videos-stat-card">
            <span className="videos-stat-label">Total vues</span>
            <span className="videos-stat-value">{totalVues.toLocaleString()}</span>
          </div>
          <div className="videos-stat-card">
            <span className="videos-stat-label">Vidéos</span>
            <span className="videos-stat-value">{nbVideos}</span>
          </div>
          <div className="videos-stat-card">
            <span className="videos-stat-label">Shorts</span>
            <span className="videos-stat-value">{nbShorts}</span>
          </div>
          <div className="videos-stat-card videos-stat-card--best">
            <span className="videos-stat-label">Meilleure vidéo</span>
            <span className="videos-stat-value">{bestVideo ? bestVideo.vues.toLocaleString() : "—"} vues</span>
            {bestVideo && <span className="videos-stat-sub">{bestVideo.titre}</span>}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="videos-loading">Chargement...</p>
        ) : (
          <div className="videos-table-wrap">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Creator</th>
                  <th>Date</th>
                  <th>Vues</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="videos-empty">
                      Aucune vidéo trouvée
                    </td>
                  </tr>
                ) : filtered.map((v, i) => (
                  <tr key={v.id}>
                    <td className="videos-num">{i + 1}</td>
                    <td className="videos-titre">{v.titre}</td>
                    <td>
                      <span className={`videos-badge ${v.type === "Short" ? "badge-short" : "badge-video"}`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="videos-creator">{v.createur || "—"}</td>
                    <td className="videos-date">{v.date || "—"}</td>
                    <td className="videos-vues">{(v.vues || 0).toLocaleString()}</td>
                    {canManage && (
                      <td className="videos-actions">
                        <button className="btn-edit" onClick={() => openEdit(v)}>Modifier</button>
                        <button className="btn-delete" onClick={() => setDeleteVideo(v)}>Supprimer</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP AJOUTER */}
      {showAdd && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="videos-popup">
            <h2>Ajouter vidéo</h2>
            <VideoForm form={form} onChange={handleChange} creators={creators} />
            <button className="popup-save" onClick={addVideo}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editVideo && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setEditVideo(null)}>
          <div className="videos-popup">
            <h2>Modifier vidéo</h2>
            <VideoForm form={form} onChange={handleChange} creators={creators} />
            <button className="popup-save" onClick={updateVideo}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setEditVideo(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deleteVideo && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteVideo(null)}>
          <div className="videos-popup videos-popup--delete">
            <h2>Supprimer vidéo ?</h2>
            <p>
              Cette action est irréversible.<br />
              <strong>{deleteVideo.titre}</strong>
            </p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>Oui supprimer</button>
            <button className="popup-close" onClick={() => setDeleteVideo(null)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}

function VideoForm({ form, onChange, creators }) {
  return (
    <div className="popup-fields">
      <input
        name="titre"
        type="text"
        placeholder="Titre de la vidéo"
        value={form.titre || ""}
        onChange={onChange}
      />

      <select name="type" value={form.type || ""} onChange={onChange} className="popup-select">
        <option value="">Type de contenu</option>
        <option value="Vidéo">Vidéo</option>
        <option value="Short">Short</option>
      </select>

      <select name="createur" value={form.createur || ""} onChange={onChange} className="popup-select">
        <option value="">Créateur (optionnel)</option>
        {creators.map(c => (
          <option key={c.pseudo} value={c.pseudo}>{c.pseudo}</option>
        ))}
      </select>

      <input
        name="date"
        type="text"
        placeholder="Date (ex: 13/3/2026)"
        value={form.date || ""}
        onChange={onChange}
      />

      <input
        name="vues"
        type="number"
        min="0"
        placeholder="Nombre de vues"
        value={form.vues || ""}
        onChange={onChange}
      />
    </div>
  );
}

export default Videos;
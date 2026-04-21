import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/creators.css";

function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editCreator, setEditCreator] = useState(null);
  const [deleteCreator, setDeleteCreator] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    pseudo: "", role: "", youtube_url: "", tiktok_url: "", twitch_url: "",
    yt_abonnes_debut: "", tiktok_abonnes_debut: "",
    yt_abonnes_now: "", tiktok_abonnes_now: "", nb_videos: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadCreators(); }, []);

  async function loadCreators() {
    const { data } = await supabase
      .from("creators")
      .select("*")
      .order("pseudo", { ascending: true });
    setCreators(data || []);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addCreator() {
    if (!form.pseudo) { alert("Le pseudo est requis"); return; }
    await supabase.from("creators").insert([{
      ...form,
      yt_abonnes_debut:     parseInt(form.yt_abonnes_debut)     || 0,
      tiktok_abonnes_debut: parseInt(form.tiktok_abonnes_debut) || 0,
      yt_abonnes_now:       parseInt(form.yt_abonnes_now)       || 0,
      tiktok_abonnes_now:   parseInt(form.tiktok_abonnes_now)   || 0,
      nb_videos:            parseInt(form.nb_videos)            || 0,
    }]);
    setShowAdd(false);
    setForm(emptyForm);
    loadCreators();
  }

  async function updateCreator() {
    await supabase.from("creators").update({
      ...form,
      yt_abonnes_debut:     parseInt(form.yt_abonnes_debut)     || 0,
      tiktok_abonnes_debut: parseInt(form.tiktok_abonnes_debut) || 0,
      yt_abonnes_now:       parseInt(form.yt_abonnes_now)       || 0,
      tiktok_abonnes_now:   parseInt(form.tiktok_abonnes_now)   || 0,
      nb_videos:            parseInt(form.nb_videos)            || 0,
    }).eq("id", editCreator.id);
    setEditCreator(null);
    setForm(emptyForm);
    loadCreators();
  }

  async function confirmDelete() {
    await supabase.from("creators").delete().eq("id", deleteCreator.id);
    setDeleteCreator(null);
    loadCreators();
  }



  const roleColor = (role) => {
    if (role === "Content Creator") return "badge-creator";
    if (role === "Ambassadeur")     return "badge-ambassador";
    return "badge-default";
  };

  const growth = (now, debut) => {
    if (!debut || debut === 0) return null;
    const diff = now - debut;
    const pct  = Math.round((diff / debut) * 100);
    return { diff, pct };
  };

  return (
    <section className="creators-page">
      <div className="creators-particles" />

      <div className="creators-container">

        <p className="creators-mini">ONE PRODIGE</p>
        <h1 className="creators-title">Creators</h1>
        <p className="creators-sub">Content creators & ambassadeurs</p>

        {canManage && (
          <button
            className="creators-add-btn"
            onClick={() => { setForm(emptyForm); setShowAdd(true); }}
          >
            + Ajouter creator
          </button>
        )}

        {loading ? (
          <p className="creators-loading">Chargement...</p>
        ) : (
          <div className="creators-grid">
            {creators.map((c) => {
              const ytGrowth     = growth(c.yt_abonnes_now, c.yt_abonnes_debut);
              const tiktokGrowth = growth(c.tiktok_abonnes_now, c.tiktok_abonnes_debut);

              return (
                <div key={c.id} className="creator-card">

                  <div className="creator-card-header">
                    <div className="creator-avatar">
                      {c.pseudo?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="creator-name">{c.pseudo}</h3>
                      <span className={`creators-badge ${roleColor(c.role)}`}>
                        {c.role || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="creator-stats">

                    {/* YOUTUBE */}
                    {c.youtube_url && (
                      <div className="creator-stat-block">
                        <span className="creator-stat-platform">🎬 YouTube</span>
                        <div className="creator-stat-row">
                          <span className="creator-stat-label">Début</span>
                          <span className="creator-stat-val">{c.yt_abonnes_debut?.toLocaleString() || "—"}</span>
                        </div>
                        <div className="creator-stat-row">
                          <span className="creator-stat-label">Maintenant</span>
                          <span className="creator-stat-val">{c.yt_abonnes_now?.toLocaleString() || "—"}</span>
                        </div>
                        {ytGrowth && (
                          <div className={`creator-growth ${ytGrowth.diff >= 0 ? "growth-pos" : "growth-neg"}`}>
                            {ytGrowth.diff >= 0 ? "▲" : "▼"} {Math.abs(ytGrowth.diff).toLocaleString()} ({ytGrowth.pct}%)
                          </div>
                        )}
                      </div>
                    )}

                    {/* TIKTOK */}
                    {c.tiktok_url && (
                      <div className="creator-stat-block">
                        <span className="creator-stat-platform">🎵 TikTok</span>
                        <div className="creator-stat-row">
                          <span className="creator-stat-label">Début</span>
                          <span className="creator-stat-val">{c.tiktok_abonnes_debut?.toLocaleString() || "—"}</span>
                        </div>
                        <div className="creator-stat-row">
                          <span className="creator-stat-label">Maintenant</span>
                          <span className="creator-stat-val">{c.tiktok_abonnes_now?.toLocaleString() || "—"}</span>
                        </div>
                        {tiktokGrowth && (
                          <div className={`creator-growth ${tiktokGrowth.diff >= 0 ? "growth-pos" : "growth-neg"}`}>
                            {tiktokGrowth.diff >= 0 ? "▲" : "▼"} {Math.abs(tiktokGrowth.diff).toLocaleString()} ({tiktokGrowth.pct}%)
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* LINKS */}
                  <div className="creator-links">
                    {c.youtube_url && (
                      <a href={c.youtube_url} target="_blank" rel="noreferrer" className="creator-link yt">
                        YouTube
                      </a>
                    )}
                    {c.tiktok_url && (
                      <a href={c.tiktok_url} target="_blank" rel="noreferrer" className="creator-link tt">
                        TikTok
                      </a>
                    )}
                    {c.twitch_url && (
                      <a href={c.twitch_url} target="_blank" rel="noreferrer" className="creator-link tw">
                        Twitch
                      </a>
                    )}
                  </div>

                  <div className="creator-nb-videos">
                    🎥 {c.nb_videos || 0} vidéo{c.nb_videos !== 1 ? "s" : ""}
                  </div>

                  {canManage && (
                    <div className="creator-actions">
                      <button className="btn-edit" onClick={() => openEdit(c)}>Modifier</button>
                      <button className="btn-delete" onClick={() => setDeleteCreator(c)}>Supprimer</button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP AJOUTER */}
      {showAdd && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="creators-popup">
            <h2>Ajouter creator</h2>
            <CreatorForm form={form} onChange={handleChange} />
            <button className="popup-save" onClick={addCreator}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editCreator && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setEditCreator(null)}>
          <div className="creators-popup">
            <h2>Modifier creator</h2>
            <CreatorForm form={form} onChange={handleChange} />
            <button className="popup-save" onClick={updateCreator}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setEditCreator(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deleteCreator && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteCreator(null)}>
          <div className="creators-popup creators-popup--delete">
            <h2>Supprimer creator ?</h2>
            <p>
              Cette action est irréversible.<br />
              <strong>{deleteCreator.pseudo}</strong> sera supprimé définitivement.
            </p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>Oui supprimer</button>
            <button className="popup-close" onClick={() => setDeleteCreator(null)}>Annuler</button>
          </div>
        </div>
      )}

    </section>
  );
}

function CreatorForm({ form, onChange }) {
  const fields = [
    { name: "pseudo",               placeholder: "Pseudo",                       type: "text",   min: null },
    { name: "role",                 placeholder: "Rôle (Content Creator / Ambassadeur)", type: "text", min: null },
    { name: "youtube_url",          placeholder: "YouTube URL",                   type: "text",   min: null },
    { name: "tiktok_url",           placeholder: "TikTok URL",                    type: "text",   min: null },
    { name: "twitch_url",           placeholder: "Twitch URL",                    type: "text",   min: null },
    { name: "yt_abonnes_debut",     placeholder: "Abonnés YouTube au début",      type: "number", min: 0 },
    { name: "yt_abonnes_now",       placeholder: "Abonnés YouTube maintenant",    type: "number", min: 0 },
    { name: "tiktok_abonnes_debut", placeholder: "Abonnés TikTok au début",       type: "number", min: 0 },
    { name: "tiktok_abonnes_now",   placeholder: "Abonnés TikTok maintenant",     type: "number", min: 0 },
    { name: "nb_videos",            placeholder: "Nombre de vidéos",              type: "number", min: 0 },
  ];

  return (
    <div className="popup-fields">
      {fields.map(f => (
        <input
          key={f.name}
          name={f.name}
          type={f.type}
          placeholder={f.placeholder}
          value={form[f.name] || ""}
          onChange={onChange}
          {...(f.min !== null && { min: f.min })}
        />
      ))}
    </div>
  );
}



export default Creators;
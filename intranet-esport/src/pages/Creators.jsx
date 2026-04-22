import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/creators.css";

function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editCreator, setEditCreator] = useState(null);
  const [deleteCreator, setDeleteCreator] = useState(null);
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { pseudo: "", role: "", youtube_url: "", tiktok_url: "", twitch_url: "", yt_abonnes_debut: "", tiktok_abonnes_debut: "", yt_abonnes_now: "", tiktok_abonnes_now: "", nb_videos: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadCreators(); }, []);

  async function loadCreators() {
    const { data } = await supabase.from("creators").select("*").order("pseudo", { ascending: true });
    setCreators(data || []);
    setLoading(false);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addCreator() {
    if (!form.pseudo) { alert("Le pseudo est requis"); return; }
    await supabase.from("creators").insert([{ ...form, yt_abonnes_debut: parseInt(form.yt_abonnes_debut)||0, tiktok_abonnes_debut: parseInt(form.tiktok_abonnes_debut)||0, yt_abonnes_now: parseInt(form.yt_abonnes_now)||0, tiktok_abonnes_now: parseInt(form.tiktok_abonnes_now)||0, nb_videos: parseInt(form.nb_videos)||0 }]);
    setShowAdd(false); setForm(emptyForm); loadCreators();
  }

  async function updateCreator() {
    await supabase.from("creators").update({ ...form, yt_abonnes_debut: parseInt(form.yt_abonnes_debut)||0, tiktok_abonnes_debut: parseInt(form.tiktok_abonnes_debut)||0, yt_abonnes_now: parseInt(form.yt_abonnes_now)||0, tiktok_abonnes_now: parseInt(form.tiktok_abonnes_now)||0, nb_videos: parseInt(form.nb_videos)||0 }).eq("id", editCreator.id);
    setEditCreator(null); setForm(emptyForm); loadCreators();
  }

  async function confirmDelete() {
    await supabase.from("creators").delete().eq("id", deleteCreator.id);
    setDeleteCreator(null); loadCreators();
  }

  function openEdit(c) {
    setForm({ pseudo: c.pseudo||"", role: c.role||"", youtube_url: c.youtube_url||"", tiktok_url: c.tiktok_url||"", twitch_url: c.twitch_url||"", yt_abonnes_debut: c.yt_abonnes_debut||"", tiktok_abonnes_debut: c.tiktok_abonnes_debut||"", yt_abonnes_now: c.yt_abonnes_now||"", tiktok_abonnes_now: c.tiktok_abonnes_now||"", nb_videos: c.nb_videos||"" });
    setEditCreator(c);
  }

  const roleColor = (role) => {
    if (role === "Content Creator") return "badge-creator";
    if (role === "Ambassadeur" || role === "Ambassador") return "badge-ambassador";
    return "badge-default";
  };

  const growth = (now, debut) => {
    if (!debut || debut === 0) return null;
    const diff = now - debut;
    const pct = Math.round((diff / debut) * 100);
    return { diff, pct };
  };

  return (
    <section className="creators-page">
      <div className="creators-particles" />
      <div className="creators-container">

        <p className="creators-mini">{t.creators_mini}</p>
        <h1 className="creators-title">{t.creators_title}</h1>
        <p className="creators-sub">{t.creators_sub}</p>

        {canManage && (
          <button className="creators-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>{t.creators_add}</button>
        )}

        {loading ? <p className="creators-loading">{t.creators_loading}</p> : (
          <div className="creators-grid">
            {creators.map((c) => {
              const ytGrowth     = growth(c.yt_abonnes_now, c.yt_abonnes_debut);
              const tiktokGrowth = growth(c.tiktok_abonnes_now, c.tiktok_abonnes_debut);
              return (
                <div key={c.id} className="creator-card">
                  <div className="creator-card-header">
                    <div className="creator-avatar">{c.pseudo?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="creator-name">{c.pseudo}</h3>
                      <span className={`creators-badge ${roleColor(c.role)}`}>{c.role || "—"}</span>
                    </div>
                  </div>

                  <div className="creator-stats">
                    {c.youtube_url && (
                      <div className="creator-stat-block">
                        <span className="creator-stat-platform">🎬 YouTube</span>
                        <div className="creator-stat-row"><span className="creator-stat-label">{t.creators_debut}</span><span className="creator-stat-val">{c.yt_abonnes_debut?.toLocaleString() || "—"}</span></div>
                        <div className="creator-stat-row"><span className="creator-stat-label">{t.creators_now}</span><span className="creator-stat-val">{c.yt_abonnes_now?.toLocaleString() || "—"}</span></div>
                        {ytGrowth && <div className={`creator-growth ${ytGrowth.diff >= 0 ? "growth-pos" : "growth-neg"}`}>{ytGrowth.diff >= 0 ? "▲" : "▼"} {Math.abs(ytGrowth.diff).toLocaleString()} ({ytGrowth.pct}%)</div>}
                      </div>
                    )}
                    {c.tiktok_url && (
                      <div className="creator-stat-block">
                        <span className="creator-stat-platform">🎵 TikTok</span>
                        <div className="creator-stat-row"><span className="creator-stat-label">{t.creators_debut}</span><span className="creator-stat-val">{c.tiktok_abonnes_debut?.toLocaleString() || "—"}</span></div>
                        <div className="creator-stat-row"><span className="creator-stat-label">{t.creators_now}</span><span className="creator-stat-val">{c.tiktok_abonnes_now?.toLocaleString() || "—"}</span></div>
                        {tiktokGrowth && <div className={`creator-growth ${tiktokGrowth.diff >= 0 ? "growth-pos" : "growth-neg"}`}>{tiktokGrowth.diff >= 0 ? "▲" : "▼"} {Math.abs(tiktokGrowth.diff).toLocaleString()} ({tiktokGrowth.pct}%)</div>}
                      </div>
                    )}
                  </div>

                  <div className="creator-links">
                    {c.youtube_url && <a href={c.youtube_url} target="_blank" rel="noreferrer" className="creator-link yt">YouTube</a>}
                    {c.tiktok_url  && <a href={c.tiktok_url}  target="_blank" rel="noreferrer" className="creator-link tt">TikTok</a>}
                    {c.twitch_url  && <a href={c.twitch_url}  target="_blank" rel="noreferrer" className="creator-link tw">Twitch</a>}
                  </div>

                  <div className="creator-nb-videos">🎥 {c.nb_videos || 0} {c.nb_videos !== 1 ? t.creators_videos_p : t.creators_videos}</div>

                  {canManage && (
                    <div className="creator-actions">
                      <button className="btn-edit" onClick={() => openEdit(c)}>{t.creators_modifier}</button>
                      <button className="btn-delete" onClick={() => setDeleteCreator(c)}>{t.creators_supprimer}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="creators-popup">
            <h2>{t.creators_add_title}</h2>
            <CreatorForm form={form} onChange={handleChange} t={t} />
            <button className="popup-save" onClick={addCreator}>{t.creators_save}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{t.creators_close}</button>
          </div>
        </div>
      )}

      {editCreator && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setEditCreator(null)}>
          <div className="creators-popup">
            <h2>{t.creators_edit_title}</h2>
            <CreatorForm form={form} onChange={handleChange} t={t} />
            <button className="popup-save" onClick={updateCreator}>{t.creators_save}</button>
            <button className="popup-close" onClick={() => setEditCreator(null)}>{t.creators_close}</button>
          </div>
        </div>
      )}

      {deleteCreator && (
        <div className="creators-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteCreator(null)}>
          <div className="creators-popup creators-popup--delete">
            <h2>{t.creators_del_title}</h2>
            <p>{t.creators_del_text}<br /><strong>{deleteCreator.pseudo}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{t.creators_oui}</button>
            <button className="popup-close" onClick={() => setDeleteCreator(null)}>{t.creators_annuler}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function CreatorForm({ form, onChange, t }) {
  const fields = [
    { name: "pseudo",               placeholder: "Pseudo",           type: "text",   min: null },
    { name: "role",                 placeholder: "Rôle",             type: "text",   min: null },
    { name: "youtube_url",          placeholder: "YouTube URL",      type: "text",   min: null },
    { name: "tiktok_url",           placeholder: "TikTok URL",       type: "text",   min: null },
    { name: "twitch_url",           placeholder: "Twitch URL",       type: "text",   min: null },
    { name: "yt_abonnes_debut",     placeholder: "Abonnés YouTube " + t.creators_debut, type: "number", min: 0 },
    { name: "yt_abonnes_now",       placeholder: "Abonnés YouTube " + t.creators_now,   type: "number", min: 0 },
    { name: "tiktok_abonnes_debut", placeholder: "Abonnés TikTok "  + t.creators_debut, type: "number", min: 0 },
    { name: "tiktok_abonnes_now",   placeholder: "Abonnés TikTok "  + t.creators_now,   type: "number", min: 0 },
    { name: "nb_videos",            placeholder: t.creators_videos_p, type: "number", min: 0 },
  ];
  return (
    <div className="popup-fields">
      {fields.map(f => (
        <input key={f.name} name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name] || ""} onChange={onChange} {...(f.min !== null && { min: f.min })} />
      ))}
    </div>
  );
}

export default Creators;
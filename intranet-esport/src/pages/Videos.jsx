import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
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
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { titre: "", date: "", vues: "", createur: "", type: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadVideos(); loadCreators(); }, []);

  async function loadVideos() {
    const { data } = await supabase.from("videos").select("*").order("date", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }

  async function loadCreators() {
    const { data } = await supabase.from("creators").select("pseudo").order("pseudo", { ascending: true });
    setCreators(data || []);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addVideo() {
    if (!form.titre || !form.type) { alert("Titre et type requis"); return; }
    await supabase.from("videos").insert([{ ...form, vues: parseInt(form.vues)||0 }]);
    setShowAdd(false); setForm(emptyForm); loadVideos();
  }

  async function updateVideo() {
    await supabase.from("videos").update({ ...form, vues: parseInt(form.vues)||0 }).eq("id", editVideo.id);
    setEditVideo(null); setForm(emptyForm); loadVideos();
  }

  async function confirmDelete() {
    await supabase.from("videos").delete().eq("id", deleteVideo.id);
    setDeleteVideo(null); loadVideos();
  }

  function openEdit(v) {
    setForm({ titre: v.titre||"", date: v.date||"", vues: v.vues||"", createur: v.createur||"", type: v.type||"" });
    setEditVideo(v);
  }

  const filtered = videos.filter(v => {
    const okCreateur = filterCreateur === "tous" || v.createur === filterCreateur;
    const okType     = filterType === "tous"     || v.type === filterType;
    return okCreateur && okType;
  });

  const totalVues = filtered.reduce((s, v) => s + (v.vues || 0), 0);
  const bestVideo = filtered.length ? filtered.reduce((a, b) => (a.vues||0) > (b.vues||0) ? a : b) : null;
  const nbShorts  = filtered.filter(v => v.type === "Short").length;
  const nbVideos  = filtered.filter(v => v.type === "Vidéo").length;

  return (
    <section className="videos-page">
      <div className="videos-particles" />
      <div className="videos-container">

        <p className="videos-mini">{t.videos_mini}</p>
        <h1 className="videos-title">{t.videos_title}</h1>
        <p className="videos-sub">{t.videos_sub}</p>

        <div className="videos-filters">
          <select className="videos-select" value={filterCreateur} onChange={(e) => setFilterCreateur(e.target.value)}>
            <option value="tous">{t.videos_all_cc}</option>
            {creators.map(c => <option key={c.pseudo} value={c.pseudo}>{c.pseudo}</option>)}
          </select>
          <select className="videos-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="tous">{t.videos_all_types}</option>
            <option value="Vidéo">Vidéo</option>
            <option value="Short">Short</option>
          </select>
          {canManage && <button className="videos-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>{t.videos_add}</button>}
        </div>

        <div className="videos-stats-grid">
          <div className="videos-stat-card"><span className="videos-stat-label">{t.videos_total}</span><span className="videos-stat-value">{totalVues.toLocaleString()}</span></div>
          <div className="videos-stat-card"><span className="videos-stat-label">{t.videos_nb}</span><span className="videos-stat-value">{nbVideos}</span></div>
          <div className="videos-stat-card"><span className="videos-stat-label">{t.videos_shorts}</span><span className="videos-stat-value">{nbShorts}</span></div>
          <div className="videos-stat-card videos-stat-card--best">
            <span className="videos-stat-label">{t.videos_best}</span>
            <span className="videos-stat-value">{bestVideo ? bestVideo.vues.toLocaleString() : "—"} {t.videos_vues}</span>
            {bestVideo && <span className="videos-stat-sub">{bestVideo.titre}</span>}
          </div>
        </div>

        {loading ? <p className="videos-loading">{t.videos_loading}</p> : (
          <div className="videos-table-wrap">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>#</th><th>{t.videos_titre}</th><th>{t.videos_type}</th>
                  <th>{t.videos_creator}</th><th>{t.videos_date}</th>
                  <th>{t.videos_total}</th>{canManage && <th>{t.videos_actions}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={canManage ? 7 : 6} className="videos-empty">{t.videos_empty}</td></tr>
                ) : filtered.map((v, i) => (
                  <tr key={v.id}>
                    <td className="videos-num">{i + 1}</td>
                    <td className="videos-titre">{v.titre}</td>
                    <td><span className={`videos-badge ${v.type === "Short" ? "badge-short" : "badge-video"}`}>{v.type}</span></td>
                    <td className="videos-creator">{v.createur || "—"}</td>
                    <td className="videos-date">{v.date || "—"}</td>
                    <td className="videos-vues">{(v.vues || 0).toLocaleString()}</td>
                    {canManage && (
                      <td className="videos-actions">
                        <button className="btn-edit" onClick={() => openEdit(v)}>{t.videos_modifier}</button>
                        <button className="btn-delete" onClick={() => setDeleteVideo(v)}>{t.videos_supprimer}</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="videos-popup">
            <h2>{t.videos_add_title}</h2>
            <VideoForm form={form} onChange={handleChange} creators={creators} t={t} />
            <button className="popup-save" onClick={addVideo}>{t.videos_save}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{t.videos_close}</button>
          </div>
        </div>
      )}

      {editVideo && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setEditVideo(null)}>
          <div className="videos-popup">
            <h2>{t.videos_edit_title}</h2>
            <VideoForm form={form} onChange={handleChange} creators={creators} t={t} />
            <button className="popup-save" onClick={updateVideo}>{t.videos_save}</button>
            <button className="popup-close" onClick={() => setEditVideo(null)}>{t.videos_close}</button>
          </div>
        </div>
      )}

      {deleteVideo && (
        <div className="videos-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteVideo(null)}>
          <div className="videos-popup videos-popup--delete">
            <h2>{t.videos_del_title}</h2>
            <p>{t.videos_del_text}<br /><strong>{deleteVideo.titre}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{t.videos_oui}</button>
            <button className="popup-close" onClick={() => setDeleteVideo(null)}>{t.videos_annuler}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function VideoForm({ form, onChange, creators, t }) {
  return (
    <div className="popup-fields">
      <input name="titre" type="text" placeholder={t.videos_titre} value={form.titre || ""} onChange={onChange} />
      <select name="type" value={form.type || ""} onChange={onChange} className="popup-select">
        <option value="">{t.videos_type}</option>
        <option value="Vidéo">Vidéo</option>
        <option value="Short">Short</option>
      </select>
      <select name="createur" value={form.createur || ""} onChange={onChange} className="popup-select">
        <option value="">{t.videos_creator}</option>
        {creators.map(c => <option key={c.pseudo} value={c.pseudo}>{c.pseudo}</option>)}
      </select>
      <input name="date" type="text" placeholder={t.videos_date + " (ex: 13/3/2026)"} value={form.date || ""} onChange={onChange} />
      <input name="vues" type="number" min="0" placeholder={t.videos_total} value={form.vues || ""} onChange={onChange} />
    </div>
  );
}

export default Videos;
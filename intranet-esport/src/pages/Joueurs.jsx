import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import { FaFilePdf, FaEye, FaPaperclip } from "react-icons/fa";
import "../styles/joueurs.css";

function Joueurs() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [deletePlayer, setDeletePlayer] = useState(null);
  const [contratFile, setContratFile] = useState(null);
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    nom: "", age: "", nationalite: "", categorie: "",
    pr_url: "", twitch: "", youtube: "",
    twitter: "", contrat_url: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadPlayers(); }, []);

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("nom", { ascending: true });

    const ordre = { "Pro": 1, "Académique": 2, "CDF": 3 };
    const sorted = (data || []).sort((a, b) => {
      const orderA = ordre[a.categorie] || 99;
      const orderB = ordre[b.categorie] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.nom || "").localeCompare(b.nom || "");
    });

    setPlayers(sorted);
    setLoading(false);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addPlayer() {
    if (!form.nom) { alert("Le pseudo est requis"); return; }

    let contrat_url = form.contrat_url || "";

    if (contratFile) {
      const fileName = Date.now() + "_" + contratFile.name;
      const { error: uploadError } = await supabase.storage
        .from("contrats")
        .upload(fileName, contratFile);
      if (uploadError) { alert("Erreur upload contrat : " + uploadError.message); return; }
      const { data } = supabase.storage.from("contrats").getPublicUrl(fileName);
      contrat_url = data.publicUrl;
    }

    await supabase.from("players").insert([{ ...form, contrat_url }]);
    setShowAdd(false); setForm(emptyForm); setContratFile(null); loadPlayers();
  }

  async function updatePlayer() {
    let contrat_url = form.contrat_url || "";

    if (contratFile) {
      const fileName = Date.now() + "_" + contratFile.name;
      const { error: uploadError } = await supabase.storage
        .from("contrats")
        .upload(fileName, contratFile);
      if (!uploadError) {
        const { data } = supabase.storage.from("contrats").getPublicUrl(fileName);
        contrat_url = data.publicUrl;
      }
    }

    await supabase.from("players").update({ ...form, contrat_url }).eq("id", editPlayer.id);
    setEditPlayer(null); setForm(emptyForm); setContratFile(null); loadPlayers();
  }

  async function confirmDelete() {
    await supabase.from("players").delete().eq("id", deletePlayer.id);
    setDeletePlayer(null); loadPlayers();
  }

  function openEdit(player) {
    setForm({
      nom:         player.nom         || "",
      age:         player.age         || "",
      nationalite: player.nationalite || "",
      categorie:   player.categorie   || "",
      pr_url:      player.pr_url      || "",
      twitch:      player.twitch      || "",
      youtube:     player.youtube     || "",
      twitter:     player.twitter     || "",
      contrat_url: player.contrat_url || "",
    });
    setContratFile(null);
    setEditPlayer(player);
  }

  const categorieColor = (cat) => {
    if (cat === "Pro")        return "badge-pro";
    if (cat === "CDF")        return "badge-cdf";
    if (cat === "Académique") return "badge-acad";
    return "badge-default";
  };

  return (
    <section className="joueurs-page">
      <div className="joueurs-particles" />
      <div className="joueurs-container">

        <p className="joueurs-mini">{t.joueurs_mini}</p>
        <h1 className="joueurs-title">{t.joueurs_title}</h1>
        <p className="joueurs-sub">{t.joueurs_sub}</p>

        {canManage && (
          <button
            className="joueurs-add-btn"
            onClick={() => { setForm(emptyForm); setContratFile(null); setShowAdd(true); }}
          >
            {t.joueurs_add}
          </button>
        )}

        {loading ? (
          <p className="joueurs-loading">{t.joueurs_loading}</p>
        ) : (
          <div className="joueurs-table-wrap">
            <table className="joueurs-table">
              <thead>
                <tr>
                  <th>{t.joueurs_num}</th>
                  <th>{t.joueurs_pseudo}</th>
                  <th>{t.joueurs_cat}</th>
                  <th>{t.joueurs_age}</th>
                  <th>{t.joueurs_nation}</th>
                  <th>{t.joueurs_pr}</th>
                  <th>Contrat</th>
                  {canManage && <th>{t.joueurs_actions}</th>}
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p.id}>
                    <td className="joueurs-num">{i + 1}</td>
                    <td className="joueurs-nom">{p.nom}</td>
                    <td>
                      <span className={`joueurs-badge ${categorieColor(p.categorie)}`}>
                        {p.categorie || "—"}
                      </span>
                    </td>
                    <td>{p.age || "—"}</td>
                    <td>{p.nationalite || "—"}</td>
                    <td>
                      {p.pr_url ? (
                        <a href={p.pr_url} target="_blank" rel="noreferrer" className="joueurs-pr-link">
                          {t.joueurs_voir_pr}
                        </a>
                      ) : "—"}
                    </td>
                    <td>
                      {p.contrat_url ? (
                        <a href={p.contrat_url} target="_blank" rel="noreferrer" className="joueurs-contrat-link">
                          <FaFilePdf /> PDF
                        </a>
                      ) : "—"}
                    </td>
                    {canManage && (
                      <td className="joueurs-actions">
                        <button className="btn-edit" onClick={() => openEdit(p)}>{t.joueurs_modifier}</button>
                        <button className="btn-delete" onClick={() => setDeletePlayer(p)}>{t.joueurs_supprimer}</button>
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
        <div className="joueurs-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="joueurs-popup">
            <h2>{t.joueurs_add_title}</h2>
            <PlayerForm form={form} onChange={handleChange} t={t} lang={lang} contratFile={contratFile} setContratFile={setContratFile} />
            <button className="popup-save" onClick={addPlayer}>{t.joueurs_save}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{t.joueurs_close}</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editPlayer && (
        <div className="joueurs-overlay" onClick={(e) => e.target === e.currentTarget && setEditPlayer(null)}>
          <div className="joueurs-popup">
            <h2>{t.joueurs_edit_title}</h2>
            <PlayerForm form={form} onChange={handleChange} t={t} lang={lang} contratFile={contratFile} setContratFile={setContratFile} />
            <button className="popup-save" onClick={updatePlayer}>{t.joueurs_save}</button>
            <button className="popup-close" onClick={() => setEditPlayer(null)}>{t.joueurs_close}</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deletePlayer && (
        <div className="joueurs-overlay" onClick={(e) => e.target === e.currentTarget && setDeletePlayer(null)}>
          <div className="joueurs-popup joueurs-popup--delete">
            <h2>{t.joueurs_del_title}</h2>
            <p>{t.joueurs_del_text}<br /><strong>{deletePlayer.nom}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{t.joueurs_oui}</button>
            <button className="popup-close" onClick={() => setDeletePlayer(null)}>{t.joueurs_annuler}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayerForm({ form, onChange, t, lang, contratFile, setContratFile }) {
  return (
    <div className="popup-fields">
      <input name="nom"         type="text"   placeholder={t.joueurs_pseudo}      value={form.nom         || ""} onChange={onChange} />
      <input name="age"         type="number" min="0" placeholder={t.joueurs_age} value={form.age         || ""} onChange={onChange} />
      <input name="nationalite" type="text"   placeholder={t.joueurs_nation}      value={form.nationalite || ""} onChange={onChange} />

      <select name="categorie" value={form.categorie || ""} onChange={onChange} className="popup-select">
        <option value="">{t.joueurs_cat}</option>
        <option value="Pro">Pro</option>
        <option value="Académique">Académique</option>
        <option value="CDF">CDF</option>
      </select>

      <input name="pr_url"  type="text" placeholder={t.joueurs_pr + " URL"} value={form.pr_url  || ""} onChange={onChange} />
      <input name="twitch"  type="text" placeholder="Twitch URL"            value={form.twitch  || ""} onChange={onChange} />
      <input name="youtube" type="text" placeholder="YouTube URL"           value={form.youtube || ""} onChange={onChange} />
      <input name="twitter" type="text" placeholder="Twitter URL"           value={form.twitter || ""} onChange={onChange} />

      {/* CONTRAT PDF */}
      <div className="contrat-upload">
        <div className="contrat-upload-header">
          <FaFilePdf className="contrat-pdf-icon" />
          <span className="contrat-label">
            {lang === "fr" ? "Contrat PDF" : "PDF Contract"}
          </span>
        </div>

        {form.contrat_url && (
          <a href={form.contrat_url} target="_blank" rel="noreferrer" className="contrat-view-btn">
            <FaEye /> {lang === "fr" ? "Voir le contrat actuel" : "View current contract"}
          </a>
        )}

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setContratFile(e.target.files[0])}
          className="contrat-file-input"
        />

        {contratFile && (
          <p className="contrat-file-name">
            <FaPaperclip /> {contratFile.name}
          </p>
        )}
      </div>
    </div>
  );
}

export default Joueurs;
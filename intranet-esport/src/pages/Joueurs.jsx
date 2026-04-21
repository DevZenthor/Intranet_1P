import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/joueurs.css";

function Joueurs() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [deletePlayer, setDeletePlayer] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    nom: "", age: "", nationalite: "", pr_url: "",
    categorie: "", contrats: "", twitch: "", youtube: "", twitter: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadPlayers(); }, []);

  async function loadPlayers() {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("nom", { ascending: true });
    setPlayers(data || []);
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addPlayer() {
    if (!form.nom) { alert("Le pseudo est requis"); return; }
    await supabase.from("players").insert([form]);
    setShowAdd(false);
    setForm(emptyForm);
    loadPlayers();
  }

  async function updatePlayer() {
    await supabase.from("players").update(form).eq("id", editPlayer.id);
    setEditPlayer(null);
    setForm(emptyForm);
    loadPlayers();
  }

  async function confirmDelete() {
    await supabase.from("players").delete().eq("id", deletePlayer.id);
    setDeletePlayer(null);
    loadPlayers();
  }

  function openEdit(player) {
    setForm({ ...player });
    setEditPlayer(player);
  }

  const categorieColor = (cat) => {
    if (cat === "Pro") return "badge-pro";
    if (cat === "CDF") return "badge-cdf";
    if (cat === "Académique") return "badge-acad";
    return "badge-default";
  };

  return (
    <section className="joueurs-page">
      <div className="joueurs-particles" />

      <div className="joueurs-container">

        <p className="joueurs-mini">ONE PRODIGE</p>
        <h1 className="joueurs-title">Joueurs</h1>
        <p className="joueurs-sub">Roster Fortnite compétitif</p>

        {canManage && (
          <button className="joueurs-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
            + Ajouter joueur
          </button>
        )}

        {loading ? (
          <p className="joueurs-loading">Chargement...</p>
        ) : (
          <div className="joueurs-table-wrap">
            <table className="joueurs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pseudo</th>
                  <th>Catégorie</th>
                  <th>Âge</th>
                  <th>Nation</th>
                  <th>PR</th>
                  <th>Contrat</th>
                  {canManage && <th>Actions</th>}
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
                          Voir PR
                        </a>
                      ) : "—"}
                    </td>
                    <td>{p.contrats || "—"}</td>
                    {canManage && (
                      <td className="joueurs-actions">
                        <button className="btn-edit" onClick={() => openEdit(p)}>Modifier</button>
                        <button className="btn-delete" onClick={() => setDeletePlayer(p)}>Supprimer</button>
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
            <h2>Ajouter joueur</h2>
            <PlayerForm form={form} onChange={handleChange} />
            <button className="popup-save" onClick={addPlayer}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editPlayer && (
        <div className="joueurs-overlay" onClick={(e) => e.target === e.currentTarget && setEditPlayer(null)}>
          <div className="joueurs-popup">
            <h2>Modifier joueur</h2>
            <PlayerForm form={form} onChange={handleChange} />
            <button className="popup-save" onClick={updatePlayer}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setEditPlayer(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deletePlayer && (
        <div className="joueurs-overlay" onClick={(e) => e.target === e.currentTarget && setDeletePlayer(null)}>
          <div className="joueurs-popup joueurs-popup--delete">
            <h2>Supprimer joueur ?</h2>
            <p>Cette action est irréversible.<br /><strong>{deletePlayer.nom}</strong> sera supprimé définitivement.</p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>Oui supprimer</button>
            <button className="popup-close" onClick={() => setDeletePlayer(null)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayerForm({ form, onChange }) {
  return (
    <div className="popup-fields">
      <input
        name="nom"
        type="text"
        placeholder="Pseudo"
        value={form.nom || ""}
        onChange={onChange}
      />
      <input
        name="age"
        type="number"
        min="0"
        placeholder="Âge"
        value={form.age || ""}
        onChange={onChange}
      />
      <input
        name="nationalite"
        type="text"
        placeholder="Nationalité"
        value={form.nationalite || ""}
        onChange={onChange}
      />

      {/* MENU DÉROULANT CATÉGORIE */}
      <select name="categorie" value={form.categorie || ""} onChange={onChange} className="popup-select">
        <option value="">Sélectionner une catégorie</option>
        <option value="Pro">Pro</option>
        <option value="CDF">CDF</option>
        <option value="Académique">Académique</option>
      </select>

      <input
        name="pr_url"
        type="text"
        placeholder="Lien PR Tracker"
        value={form.pr_url || ""}
        onChange={onChange}
      />
      <input
        name="contrats"
        type="text"
        placeholder="Contrat"
        value={form.contrats || ""}
        onChange={onChange}
      />
      <input
        name="twitch"
        type="text"
        placeholder="Twitch URL"
        value={form.twitch || ""}
        onChange={onChange}
      />
      <input
        name="youtube"
        type="text"
        placeholder="YouTube URL"
        value={form.youtube || ""}
        onChange={onChange}
      />
      <input
        name="twitter"
        type="text"
        placeholder="Twitter URL"
        value={form.twitter || ""}
        onChange={onChange}
      />
    </div>
  );
}

export default Joueurs;
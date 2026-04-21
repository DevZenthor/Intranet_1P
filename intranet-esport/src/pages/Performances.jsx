import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/performances.css";

function Performances() {
  const [perfs, setPerfs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJoueur, setFilterJoueur] = useState("tous");
  const [filterFormat, setFilterFormat] = useState("tous");
  const [showAdd, setShowAdd] = useState(false);
  const [editPerf, setEditPerf] = useState(null);
  const [deletePerf, setDeletePerf] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    joueur: "", format: "", nom_cup: "", classement: "",
    pr_gagne: "", kills: "", top1: "", points: "", cash_prize: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadPerfs();
    loadPlayers();
  }, []);

  async function loadPerfs() {
    const { data } = await supabase
      .from("performances")
      .select("*")
      .order("id", { ascending: false });
    setPerfs(data || []);
    setLoading(false);
  }

  async function loadPlayers() {
    const { data } = await supabase
      .from("players")
      .select("nom")
      .order("nom", { ascending: true });
    setPlayers(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addPerf() {
    if (!form.joueur || !form.nom_cup) { alert("Joueur et nom de cup requis"); return; }
    await supabase.from("performances").insert([{
      ...form,
      classement: parseInt(form.classement) || 0,
      pr_gagne: parseInt(form.pr_gagne) || 0,
      kills: parseInt(form.kills) || 0,
      top1: parseInt(form.top1) || 0,
      points: parseInt(form.points) || 0,
    }]);
    setShowAdd(false);
    setForm(emptyForm);
    loadPerfs();
  }

  async function updatePerf() {
    await supabase.from("performances").update({
      ...form,
      classement: parseInt(form.classement) || 0,
      pr_gagne: parseInt(form.pr_gagne) || 0,
      kills: parseInt(form.kills) || 0,
      top1: parseInt(form.top1) || 0,
      points: parseInt(form.points) || 0,
    }).eq("id", editPerf.id);
    setEditPerf(null);
    setForm(emptyForm);
    loadPerfs();
  }

  async function confirmDelete() {
    await supabase.from("performances").delete().eq("id", deletePerf.id);
    setDeletePerf(null);
    loadPerfs();
  }

  function openEdit(p) {
    setForm({ ...p });
    setEditPerf(p);
  }

  // FILTRES
  const filtered = perfs.filter(p => {
    const okJoueur = filterJoueur === "tous" || p.joueur === filterJoueur;
    const okFormat = filterFormat === "tous" || p.format === filterFormat;
    return okJoueur && okFormat;
  });

  // STATS calculées sur les données filtrées
  const stats = {
    avgKills:  filtered.length ? Math.round(filtered.reduce((s, p) => s + (p.kills || 0), 0) / filtered.length) : 0,
    avgPoints: filtered.length ? Math.round(filtered.reduce((s, p) => s + (p.points || 0), 0) / filtered.length) : 0,
    totalPR:   filtered.reduce((s, p) => s + (p.pr_gagne || 0), 0),
    bestPoints: filtered.length ? Math.max(...filtered.map(p => p.points || 0)) : 0,
    worstPoints: filtered.length ? Math.min(...filtered.map(p => p.points || 0)) : 0,
  };

  const joueurs = [...new Set(perfs.map(p => p.joueur).filter(Boolean))];

  return (
    <section className="perf-page">
      <div className="perf-particles" />

      <div className="perf-container">

        <p className="perf-mini">ONE PRODIGE</p>
        <h1 className="perf-title">Performances</h1>
        <p className="perf-sub">Statistiques compétitives Fortnite</p>

        {/* FILTRES */}
        <div className="perf-filters">
          <select
            className="perf-select"
            value={filterJoueur}
            onChange={(e) => setFilterJoueur(e.target.value)}
          >
            <option value="tous">Tous les joueurs</option>
            {joueurs.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <select
            className="perf-select"
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
          >
            <option value="tous">Tous les formats</option>
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Trio">Trio</option>
            <option value="Squad">Squad</option>
          </select>

          {canManage && (
            <button className="perf-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
              + Ajouter
            </button>
          )}
        </div>

        {/* STATS CARDS */}
        <div className="perf-stats-grid">
          <div className="perf-stat-card">
            <span className="perf-stat-label">Kills moyens</span>
            <span className="perf-stat-value">{stats.avgKills}</span>
          </div>
          <div className="perf-stat-card">
            <span className="perf-stat-label">Points moyens</span>
            <span className="perf-stat-value">{stats.avgPoints}</span>
          </div>
          <div className="perf-stat-card">
            <span className="perf-stat-label">Total PR gagné</span>
            <span className="perf-stat-value">{stats.totalPR.toLocaleString()}</span>
          </div>
          <div className="perf-stat-card perf-stat-card--best">
            <span className="perf-stat-label">Meilleure perf</span>
            <span className="perf-stat-value">{stats.bestPoints} pts</span>
          </div>
          <div className="perf-stat-card perf-stat-card--worst">
            <span className="perf-stat-label">Pire perf</span>
            <span className="perf-stat-value">{stats.worstPoints} pts</span>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="perf-loading">Chargement...</p>
        ) : (
          <div className="perf-table-wrap">
            <table className="perf-table">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Format</th>
                  <th>Cup</th>
                  <th>Classement</th>
                  <th>PR Gagné</th>
                  <th>Kills</th>
                  <th>Top 1</th>
                  <th>Points</th>
                  <th>Cash</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 10 : 9} className="perf-empty">
                      Aucune performance trouvée
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="perf-joueur">{p.joueur}</td>
                    <td>
                      <span className={`perf-badge ${p.format === "Solo" ? "badge-solo" : "badge-duo"}`}>
                        {p.format}
                      </span>
                    </td>
                    <td className="perf-cup">{p.nom_cup}</td>
                    <td className="perf-rank">#{p.classement}</td>
                    <td className={p.pr_gagne > 0 ? "perf-green" : ""}>{p.pr_gagne || 0}</td>
                    <td>{p.kills || 0}</td>
                    <td>{p.top1 ? "✓" : "—"}</td>
                    <td className="perf-points">{p.points || 0}</td>
                    <td>{p.cash_prize || "$0.00"}</td>
                    {canManage && (
                      <td className="perf-actions">
                        <button className="btn-edit" onClick={() => openEdit(p)}>Modifier</button>
                        <button className="btn-delete" onClick={() => setDeletePerf(p)}>Supprimer</button>
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
        <div className="perf-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="perf-popup">
            <h2>Ajouter performance</h2>
            <PerfForm form={form} onChange={handleChange} players={players} />
            <button className="popup-save" onClick={addPerf}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editPerf && (
        <div className="perf-overlay" onClick={(e) => e.target === e.currentTarget && setEditPerf(null)}>
          <div className="perf-popup">
            <h2>Modifier performance</h2>
            <PerfForm form={form} onChange={handleChange} players={players} />
            <button className="popup-save" onClick={updatePerf}>Sauvegarder</button>
            <button className="popup-close" onClick={() => setEditPerf(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deletePerf && (
        <div className="perf-overlay" onClick={(e) => e.target === e.currentTarget && setDeletePerf(null)}>
          <div className="perf-popup perf-popup--delete">
            <h2>Supprimer performance ?</h2>
            <p>Cette action est irréversible.<br />
              <strong>{deletePerf.joueur}</strong> — {deletePerf.nom_cup}
            </p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>Oui supprimer</button>
            <button className="popup-close" onClick={() => setDeletePerf(null)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}

function PerfForm({ form, onChange, players }) {
  return (
    <div className="popup-fields">
      <select name="joueur" value={form.joueur || ""} onChange={onChange} className="popup-select">
        <option value="">Sélectionner un joueur</option>
        {players.map(p => (
          <option key={p.nom} value={p.nom}>{p.nom}</option>
        ))}
      </select>

      <select name="format" value={form.format || ""} onChange={onChange} className="popup-select">
        <option value="">Format</option>
        <option value="Solo">Solo</option>
        <option value="Duo">Duo</option>
        <option value="Trio">Trio</option>
        <option value="Squad">Squad</option>
      </select>

      {[
        { name: "nom_cup",    placeholder: "Nom de la Cup",  type: "text"   },
        { name: "classement", placeholder: "Classement",     type: "number" },
        { name: "pr_gagne",   placeholder: "PR Gagné",       type: "number" },
        { name: "kills",      placeholder: "Kills",          type: "number" },
        { name: "top1",       placeholder: "Top 1 (1 ou 0)", type: "number" },
        { name: "points",     placeholder: "Points",         type: "number" },
        { name: "cash_prize", placeholder: "Cash Prize",     type: "text"   },
      ].map(f => (
        <input
          key={f.name}
          name={f.name}
          type={f.type}
          placeholder={f.placeholder}
          value={form[f.name] || ""}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

export default Performances;
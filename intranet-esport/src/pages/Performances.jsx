import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/performances.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Performances() {
  const [perfs, setPerfs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJoueur, setFilterJoueur] = useState("tous");
  const [filterFormat, setFilterFormat] = useState("tous");
  const [showAdd, setShowAdd] = useState(false);
  const [editPerf, setEditPerf] = useState(null);
  const [deletePerf, setDeletePerf] = useState(null);
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = {
    joueur: "", format: "", nom_cup: "", classement: "",
    pr_gagne: "", kills: "", top1: "", points: "", cash_prize: "", date: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadPerfs(); loadPlayers(); }, []);

  function parseDate(str) {
    if (!str) return 0;
    const parts = str.split("/");
    if (parts.length !== 3) return 0;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
  }

  function formatDateForDB(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
  }

  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    return `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
  }

  async function loadPerfs() {
    const { data } = await supabase.from("performances").select("*");
    const sorted = (data || []).sort((a, b) => parseDate(b.date) - parseDate(a.date));
    setPerfs(sorted);
    setLoading(false);
  }

  async function loadPlayers() {
    const { data } = await supabase
      .from("players")
      .select("nom")
      .order("nom", { ascending: true });
    setPlayers(data || []);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addPerf() {
    if (!form.joueur || !form.nom_cup) {
      alert("Joueur et nom de cup requis");
      return;
    }

    const payload = {
      joueur:     form.joueur,
      format:     form.format     || null,
      nom_cup:    form.nom_cup,
      date:       formatDateForDB(form.date) || null,
      classement: parseInt(form.classement) || 0,
      pr_gagne:   parseInt(form.pr_gagne)   || 0,
      kills:      parseInt(form.kills)      || 0,
      top1:       parseInt(form.top1)       || 0,
      points:     parseInt(form.points)     || 0,
      cash_prize: form.cash_prize           || null,
    };

    console.log("PAYLOAD:", payload);

    const { data, error } = await supabase
      .from("performances")
      .insert([payload])
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    setShowAdd(false);
    setForm(emptyForm);
    loadPerfs();
  }

  async function updatePerf() {
    const payload = {
      joueur:     form.joueur,
      format:     form.format     || null,
      nom_cup:    form.nom_cup,
      date:       formatDateForDB(form.date) || null,
      classement: parseInt(form.classement) || 0,
      pr_gagne:   parseInt(form.pr_gagne)   || 0,
      kills:      parseInt(form.kills)      || 0,
      top1:       parseInt(form.top1)       || 0,
      points:     parseInt(form.points)     || 0,
      cash_prize: form.cash_prize           || null,
    };

    const { error } = await supabase
      .from("performances")
      .update(payload)
      .eq("id", editPerf.id);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

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
    setForm({
      ...p,
      date: formatDateForInput(p.date),
    });
    setEditPerf(p);
  }

  const filtered = perfs.filter(p => {
    const okJoueur = filterJoueur === "tous" || p.joueur === filterJoueur;
    const okFormat = filterFormat === "tous" || p.format === filterFormat;
    return okJoueur && okFormat;
  });

  const stats = {
    avgKills:    filtered.length ? Math.round(filtered.reduce((s, p) => s + (p.kills   || 0), 0) / filtered.length) : 0,
    avgPoints:   filtered.length ? Math.round(filtered.reduce((s, p) => s + (p.points  || 0), 0) / filtered.length) : 0,
    totalPR:     filtered.reduce((s, p) => s + (p.pr_gagne || 0), 0),
    bestPoints:  filtered.length ? Math.max(...filtered.map(p => p.points || 0)) : 0,
    worstPoints: filtered.length ? Math.min(...filtered.map(p => p.points || 0)) : 0,
  };

  const joueurs = players.map(p => p.nom);

  const prParJoueur = {};
  filtered.forEach(p => {
    if (!prParJoueur[p.joueur]) prParJoueur[p.joueur] = 0;
    prParJoueur[p.joueur] += (p.pr_gagne || 0);
  });
  const chartData = Object.entries(prParJoueur).map(([joueur, pr]) => ({ joueur, pr }));

  return (
    <section className="perf-page">
      <div className="perf-particles" />
      <div className="perf-container">

        <p className="perf-mini">{t.perf_mini}</p>
        <h1 className="perf-title">{t.perf_title}</h1>
        <p className="perf-sub">{t.perf_sub}</p>

        <div className="perf-filters">
          <select className="perf-select" value={filterJoueur} onChange={(e) => setFilterJoueur(e.target.value)}>
            <option value="tous">{t.perf_all_players}</option>
            {joueurs.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select className="perf-select" value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
            <option value="tous">{t.perf_all_formats}</option>
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Trio">Trio</option>
            <option value="Squad">Squad</option>
          </select>
          {canManage && (
            <button
              className="perf-add-btn"
              onClick={() => { setForm(emptyForm); loadPlayers(); setShowAdd(true); }}
            >
              {t.perf_add}
            </button>
          )}
        </div>

        <div className="perf-stats-grid">
          <div className="perf-stat-card">
            <span className="perf-stat-label">{t.perf_avg_kills}</span>
            <span className="perf-stat-value">{stats.avgKills}</span>
          </div>
          <div className="perf-stat-card">
            <span className="perf-stat-label">{t.perf_avg_points}</span>
            <span className="perf-stat-value">{stats.avgPoints}</span>
          </div>
          <div className="perf-stat-card">
            <span className="perf-stat-label">{t.perf_total_pr}</span>
            <span className="perf-stat-value">{stats.totalPR.toLocaleString()}</span>
          </div>
          <div className="perf-stat-card perf-stat-card--best">
            <span className="perf-stat-label">{t.perf_best}</span>
            <span className="perf-stat-value">{stats.bestPoints} pts</span>
          </div>
          <div className="perf-stat-card perf-stat-card--worst">
            <span className="perf-stat-label">{t.perf_worst}</span>
            <span className="perf-stat-value">{stats.worstPoints} pts</span>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="perf-chart-box">
            <h3 className="perf-chart-title">{t.perf_chart}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="joueur" stroke="#aaa" tick={{ fill: "#ccc", fontWeight: 700 }} />
                <YAxis stroke="#aaa" tick={{ fill: "#ccc" }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(253,182,40,0.3)", borderRadius: 12 }}
                  labelStyle={{ color: "#FDB628", fontWeight: 900 }}
                  itemStyle={{ color: "white" }}
                />
                <Bar dataKey="pr" name={t.perf_pr} fill="#FDB628" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading ? (
          <p className="perf-loading">{t.perf_loading}</p>
        ) : (
          <div className="perf-table-wrap">
            <table className="perf-table">
              <thead>
                <tr>
                  <th>{t.perf_joueur}</th>
                  <th>{t.perf_format}</th>
                  <th>{t.perf_cup}</th>
                  <th>{t.perf_date}</th>
                  <th>{t.perf_class}</th>
                  <th>{t.perf_pr}</th>
                  <th>{t.perf_kills}</th>
                  <th>{t.perf_top1}</th>
                  <th>{t.perf_points}</th>
                  <th>{t.perf_cash}</th>
                  {canManage && <th>{t.perf_actions}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 11 : 10} className="perf-empty">
                      {t.perf_empty}
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
                    <td className="perf-date">{p.date || "—"}</td>
                    <td className="perf-rank">#{p.classement}</td>
                    <td className={p.pr_gagne > 0 ? "perf-green" : ""}>{p.pr_gagne || 0}</td>
                    <td>{p.kills || 0}</td>
                    <td>{p.top1 ? "✓" : "—"}</td>
                    <td className="perf-points">{p.points || 0}</td>
                    <td>{p.cash_prize || "—"}</td>
                    {canManage && (
                      <td className="perf-actions">
                        <button className="btn-edit" onClick={() => openEdit(p)}>{t.perf_modifier}</button>
                        <button className="btn-delete" onClick={() => setDeletePerf(p)}>{t.perf_supprimer}</button>
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
            <h2>{t.perf_add_title}</h2>
            <PerfForm form={form} onChange={handleChange} players={players} t={t} />
            <button className="popup-save" onClick={addPerf}>{t.perf_save}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{t.perf_close}</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editPerf && (
        <div className="perf-overlay" onClick={(e) => e.target === e.currentTarget && setEditPerf(null)}>
          <div className="perf-popup">
            <h2>{t.perf_edit_title}</h2>
            <PerfForm form={form} onChange={handleChange} players={players} t={t} />
            <button className="popup-save" onClick={updatePerf}>{t.perf_save}</button>
            <button className="popup-close" onClick={() => setEditPerf(null)}>{t.perf_close}</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deletePerf && (
        <div className="perf-overlay" onClick={(e) => e.target === e.currentTarget && setDeletePerf(null)}>
          <div className="perf-popup perf-popup--delete">
            <h2>{t.perf_del_title}</h2>
            <p>{t.perf_del_text}<br /><strong>{deletePerf.joueur}</strong> — {deletePerf.nom_cup}</p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{t.perf_oui}</button>
            <button className="popup-close" onClick={() => setDeletePerf(null)}>{t.perf_annuler}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function PerfForm({ form, onChange, players, t }) {
  return (
    <div className="popup-fields">
      <select name="joueur" value={form.joueur || ""} onChange={onChange} className="popup-select">
        <option value="">{t.perf_joueur}</option>
        {players.map(p => <option key={p.nom} value={p.nom}>{p.nom}</option>)}
      </select>

      <select name="format" value={form.format || ""} onChange={onChange} className="popup-select">
        <option value="">{t.perf_format}</option>
        <option value="Solo">Solo</option>
        <option value="Duo">Duo</option>
        <option value="Trio">Trio</option>
        <option value="Squad">Squad</option>
      </select>

      <input name="nom_cup"    type="text"   placeholder={t.perf_cup}              value={form.nom_cup    || ""} onChange={onChange} />
      <input name="date"       type="date"                                           value={form.date       || ""} onChange={onChange} />
      <input name="classement" type="number" placeholder={t.perf_class}  min="0"   value={form.classement || ""} onChange={onChange} />
      <input name="pr_gagne"   type="number" placeholder={t.perf_pr}     min="0"   value={form.pr_gagne   || ""} onChange={onChange} />
      <input name="kills"      type="number" placeholder={t.perf_kills}  min="0"   value={form.kills      || ""} onChange={onChange} />
      <input name="top1"       type="number" placeholder={t.perf_top1 + " (1/0)"} min="0" max="1" value={form.top1 || ""} onChange={onChange} />
      <input name="points"     type="number" placeholder={t.perf_points} min="0"   value={form.points     || ""} onChange={onChange} />
      <input name="cash_prize" type="text"   placeholder={t.perf_cash}             value={form.cash_prize || ""} onChange={onChange} />
    </div>
  );
}

export default Performances;
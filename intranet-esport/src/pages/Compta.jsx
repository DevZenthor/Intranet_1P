import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "../styles/compta.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ORDRE_MOIS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const ETATS = ["Aucun Revenu", "Revenu Faible", "Revenu Moyen", "Revenu Élevé"];

const etatColor = (etat) => {
    if (etat === "Aucun Revenu") return "etat-none";
    if (etat === "Revenu Faible") return "etat-low";
    if (etat === "Revenu Moyen") return "etat-mid";
    if (etat === "Revenu Élevé") return "etat-high";
    return "etat-none";
};

function Compta() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState(null);
    const [form, setForm] = useState({ revenus: "", etat: "", budget_fin_mois: "" });

    useEffect(() => { loadCompta(); }, []);

    async function loadCompta() {
        const { data } = await supabase.from("compta").select("*");
        if (data) {
            const sorted = [...data].sort(
                (a, b) => ORDRE_MOIS.indexOf(a.mois) - ORDRE_MOIS.indexOf(b.mois)
            );
            setRows(sorted);
        }
        setLoading(false);
    }

    function openEdit(row) {
        setForm({
            revenus: row.revenus ?? "",
            etat: row.etat ?? "",
            budget_fin_mois: row.budget_fin_mois ?? "",
        });
        setEditRow(row);
    }

    async function saveEdit() {
        await supabase.from("compta").update({
            revenus: parseFloat(form.revenus) || 0,
            etat: form.etat,
            budget_fin_mois: parseFloat(form.budget_fin_mois) || 0,
        }).eq("id", editRow.id);
        setEditRow(null);
        loadCompta();
    }

    // STATS
    const totalRevenus = rows.reduce((s, r) => s + (r.revenus || 0), 0);
    const totalBudget = rows.reduce((s, r) => s + (r.budget_fin_mois || 0), 0);
    const meilleurMois = rows.length ? rows.reduce((a, b) => (a.revenus || 0) > (b.revenus || 0) ? a : b) : null;
    const moisActif = rows.filter(r => (r.revenus || 0) > 0).length;
    const moyenneMensuelle = moisActif > 0 ? totalRevenus / moisActif : 0;

    return (
        <section className="compta-page">
            <div className="compta-particles" />

            <div className="compta-container">

                <p className="compta-mini">1P SERVICES</p>
                <h1 className="compta-title">Comptabilité</h1>
                <p className="compta-sub">Suivi des revenus mensuels 2026</p>

                {/* STATS */}
                <div className="compta-stats">

                    <div className="compta-stat-card">
                        <span className="compta-stat-icon">💰</span>
                        <span className="compta-stat-label">Total revenus</span>
                        <span className="compta-stat-value">{totalRevenus.toFixed(2)} €</span>
                    </div>

                    <div className="compta-stat-card">
                        <span className="compta-stat-icon">📊</span>
                        <span className="compta-stat-label">Budget total</span>
                        <span className="compta-stat-value">{totalBudget.toFixed(2)} €</span>
                    </div>

                    <div className="compta-stat-card">
                        <span className="compta-stat-icon">📈</span>
                        <span className="compta-stat-label">Moyenne mensuelle</span>
                        <span className="compta-stat-value">{moyenneMensuelle.toFixed(2)} €</span>
                    </div>

                    <div className="compta-stat-card compta-stat-card--gold">
                        <span className="compta-stat-icon">🏆</span>
                        <span className="compta-stat-label">Meilleur mois</span>
                        <span className="compta-stat-value">
                            {meilleurMois && meilleurMois.revenus > 0
                                ? `${meilleurMois.mois} — ${meilleurMois.revenus.toFixed(2)} €`
                                : "—"}
                        </span>
                    </div>

                    <div className="compta-stat-card">
                        <span className="compta-stat-icon">✅</span>
                        <span className="compta-stat-label">Mois avec revenus</span>
                        <span className="compta-stat-value">{moisActif} / 12</span>
                    </div>

                </div>

                {/* GRAPHIQUE REVENUS */}
                {(() => {
                    const chartData = rows.map(r => ({
                        mois: r.mois.slice(0, 3),
                        revenus: r.revenus || 0,
                    }));

                    return (
                        <div className="compta-chart-box">
                            <h3 className="compta-chart-title">Évolution des revenus 2026</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="mois" stroke="#aaa" tick={{ fill: "#ccc", fontWeight: 700 }} />
                                    <YAxis stroke="#aaa" tick={{ fill: "#ccc" }} />
                                    <Tooltip
                                        contentStyle={{ background: "#111", border: "1px solid rgba(253,182,40,0.3)", borderRadius: 12 }}
                                        labelStyle={{ color: "#FDB628", fontWeight: 900 }}
                                        itemStyle={{ color: "white" }}
                                        formatter={(val) => [`${val.toFixed(2)} €`, "Revenus"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenus"
                                        stroke="#FDB628"
                                        strokeWidth={3}
                                        dot={{ fill: "#FDB628", r: 5, strokeWidth: 0 }}
                                        activeDot={{ r: 8, fill: "#ffcf63" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })()}

                {/* TABLE */}
                {loading ? (
                    <p className="compta-loading">Chargement...</p>
                ) : (
                    <div className="compta-table-wrap">
                        <table className="compta-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>Revenus</th>
                                    <th>État</th>
                                    <th>Budget fin de mois</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id}>
                                        <td className="compta-mois">{r.mois}</td>
                                        <td className="compta-revenus">
                                            {(r.revenus || 0).toFixed(2)} €
                                        </td>
                                        <td>
                                            <span className={`compta-etat ${etatColor(r.etat)}`}>
                                                {r.etat || "—"}
                                            </span>
                                        </td>
                                        <td className={`compta-budget ${(r.budget_fin_mois || 0) > 0 ? "compta-pos" : ""}`}>
                                            {(r.budget_fin_mois || 0).toFixed(2)} €
                                        </td>
                                        <td>
                                            <button className="compta-edit-btn" onClick={() => openEdit(r)}>
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* TOTAL ROW */}
                                <tr className="compta-total-row">
                                    <td className="compta-total-label">TOTAL</td>
                                    <td className="compta-total-val">{totalRevenus.toFixed(2)} €</td>
                                    <td>—</td>
                                    <td className="compta-total-val">{totalBudget.toFixed(2)} €</td>
                                    <td>—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* POPUP MODIFIER */}
            {editRow && (
                <div
                    className="compta-overlay"
                    onClick={(e) => e.target === e.currentTarget && setEditRow(null)}
                >
                    <div className="compta-popup">

                        <h2>Modifier — {editRow.mois}</h2>

                        <div className="popup-fields">
                            <label className="compta-label">Revenus (€)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.revenus}
                                onChange={(e) => setForm({ ...form, revenus: e.target.value })}
                            />

                            <label className="compta-label">État</label>
                            <select
                                className="popup-select"
                                value={form.etat}
                                onChange={(e) => setForm({ ...form, etat: e.target.value })}
                            >
                                <option value="">Sélectionner un état</option>
                                {ETATS.map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>

                            <label className="compta-label">Budget fin de mois (€)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.budget_fin_mois}
                                onChange={(e) => setForm({ ...form, budget_fin_mois: e.target.value })}
                            />
                        </div>

                        <button className="popup-save" onClick={saveEdit}>Sauvegarder</button>
                        <button className="popup-close" onClick={() => setEditRow(null)}>Fermer</button>

                    </div>
                </div>
            )}
        </section>
    );
}

export default Compta;
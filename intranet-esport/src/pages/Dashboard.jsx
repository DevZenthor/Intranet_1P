import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import "../styles/dashboard.css";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const ORDRE_MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function Dashboard() {
  const { lang } = useLang();

  const [stats, setStats] = useState({ membres: 0, videos: 0, performances: 0, documents: 0, creators: 0, joueurs: 0 });
  const [users, setUsers] = useState([]);
  const [membres, setMembres] = useState([]);
  const [filterMembreCat, setFilterMembreCat] = useState("tous");
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [userForm, setUserForm] = useState({ pseudo: "", code: "", role: "Manager" });
  const [annonces, setAnnonces] = useState([]);
  const [compta, setCompta] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [
      { count: membres },
      { count: videos },
      { count: performances },
      { count: documents },
      { count: creators },
      { count: joueurs },
      { data: usersData },
      { data: annoncesData },
      { data: comptaData },
      { data: perfsData },
      { data: videosData },
      { data: membresData },
    ] = await Promise.all([
      supabase.from("members").select("*",      { count: "exact", head: true }),
      supabase.from("videos").select("*",       { count: "exact", head: true }),
      supabase.from("performances").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*",    { count: "exact", head: true }),
      supabase.from("creators").select("*",     { count: "exact", head: true }),
      supabase.from("players").select("*",      { count: "exact", head: true }),
      supabase.from("users").select("*").order("pseudo", { ascending: true }),
      supabase.from("annonces").select("*").order("created_at", { ascending: false }).limit(3),
      supabase.from("compta").select("*"),
      supabase.from("performances").select("joueur, pr_gagne").limit(50),
      supabase.from("videos").select("*").order("id", { ascending: false }).limit(5),
      supabase.from("members").select("*").order("id", { ascending: true }),
    ]);

    setStats({ membres, videos, performances, documents, creators, joueurs });
    setUsers(usersData || []);
    setMembres(membresData || []);
    setAnnonces(annoncesData || []);
    const sortedCompta = (comptaData || []).sort((a, b) => ORDRE_MOIS.indexOf(a.mois) - ORDRE_MOIS.indexOf(b.mois));
    setCompta(sortedCompta);
    setPerfs(perfsData || []);
    setLatestVideos(videosData || []);
    setLoading(false);
  }

  async function addUser() {
    if (!userForm.pseudo || !userForm.code) { alert("Pseudo et code requis"); return; }
    await supabase.from("users").insert([{ pseudo: userForm.pseudo, code: userForm.code, role: userForm.role }]);
    setShowAddUser(false);
    setUserForm({ pseudo: "", code: "", role: "Manager" });
    loadAll();
  }

  async function confirmDeleteUser() {
    await supabase.from("users").delete().eq("id", deleteUser.id);
    setDeleteUser(null);
    loadAll();
  }

  async function updateUserRole() {
    await supabase.from("users").update({ role: newRole }).eq("id", editUserRole.id);
    setEditUserRole(null);
    loadAll();
  }

  const prParJoueur = {};
  perfs.forEach(p => {
    if (!prParJoueur[p.joueur]) prParJoueur[p.joueur] = 0;
    prParJoueur[p.joueur] += (p.pr_gagne || 0);
  });
  const prChartData = Object.entries(prParJoueur).map(([joueur, pr]) => ({ joueur, pr }));
  const comptaChartData = compta.map(r => ({ mois: r.mois?.slice(0, 3), revenus: r.revenus || 0 }));

  const roleColor = (role) => {
    if (role === "admin")    return "role-admin";
    if (role === "CEO")      return "role-ceo";
    if (role === "Director") return "role-director";
    if (role === "Manager")  return "role-manager";
    if (role === "Coach")    return "role-coach";
    return "role-default";
  };

  const typeConfig = {
    "Annonce":      { icon: "📢", color: "type-annonce" },
    "Recrue":       { icon: "✅", color: "type-recrue"  },
    "Leave":        { icon: "👋", color: "type-leave"   },
    "Announcement": { icon: "📢", color: "type-annonce" },
    "Signing":      { icon: "✅", color: "type-recrue"  },
  };

  const CATS = [
    { key: "tous",    label: lang === "fr" ? "Tous"    : "All"     },
    { key: "staff",   label: "Staff"   },
    { key: "player",  label: lang === "fr" ? "Players" : "Players" },
    { key: "content", label: "Content" },
  ];

  const membresFiltres = membres.filter(m =>
    filterMembreCat === "tous" || m.category === filterMembreCat
  );

  if (loading) return (
    <section className="dashboard-page">
      <p className="dashboard-loading">Chargement...</p>
    </section>
  );

  return (
    <section className="dashboard-page">
      <div className="dashboard-particles" />

      <div className="dashboard-container">

        <p className="dashboard-mini">ONE PRODIGE</p>
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-sub">{lang === "fr" ? "Vue d'ensemble de l'intranet" : "Intranet overview"}</p>

        {/* STATS */}
        <div className="dashboard-stats-grid">
          {[
            { label: lang === "fr" ? "Membres"      : "Members",      value: stats.membres,      icon: "👥" },
            { label: lang === "fr" ? "Joueurs FN"   : "FN Players",   value: stats.joueurs,      icon: "🎮" },
            { label: lang === "fr" ? "Creators"     : "Creators",     value: stats.creators,     icon: "🎬" },
            { label: lang === "fr" ? "Vidéos"       : "Videos",       value: stats.videos,       icon: "📹" },
            { label: lang === "fr" ? "Performances" : "Performances", value: stats.performances, icon: "📊" },
            { label: lang === "fr" ? "Documents"    : "Documents",    value: stats.documents,    icon: "📄" },
          ].map((s, i) => (
            <div key={i} className="dashboard-stat-card">
              <span className="dashboard-stat-icon">{s.icon}</span>
              <span className="dashboard-stat-label">{s.label}</span>
              <span className="dashboard-stat-value">{s.value}</span>
            </div>
          ))}
        </div>

        {/* GRAPHIQUES */}
        <div className="dashboard-charts">
          <div className="dashboard-chart-box">
            <h3 className="dashboard-chart-title">
              {lang === "fr" ? "Revenus mensuels (€)" : "Monthly revenue (€)"}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={comptaChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mois" stroke="#aaa" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis stroke="#aaa" tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(253,182,40,0.3)", borderRadius: 12 }}
                  labelStyle={{ color: "#FDB628", fontWeight: 900 }}
                  itemStyle={{ color: "white" }}
                  formatter={(val) => [`${val.toFixed(2)} €`]}
                />
                <Line type="monotone" dataKey="revenus" stroke="#FDB628" strokeWidth={3} dot={{ fill: "#FDB628", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-chart-box">
            <h3 className="dashboard-chart-title">
              {lang === "fr" ? "PR gagné par joueur" : "PR earned per player"}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={prChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="joueur" stroke="#aaa" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis stroke="#aaa" tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(253,182,40,0.3)", borderRadius: 12 }}
                  labelStyle={{ color: "#FDB628", fontWeight: 900 }}
                  itemStyle={{ color: "white" }}
                />
                <Bar dataKey="pr" name="PR" fill="#FDB628" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MEMBRES FILTRES */}
        <div className="dashboard-section dashboard-section--full">
          <div className="dashboard-section-header">
            <h2>{lang === "fr" ? "Membres" : "Members"}</h2>
            <div className="dashboard-membre-filters">
              {CATS.map(cat => (
                <button
                  key={cat.key}
                  className={`dashboard-filter-btn ${filterMembreCat === cat.key ? "active" : ""}`}
                  onClick={() => setFilterMembreCat(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-membres-grid">
            {membresFiltres.map(m => (
              <div key={m.id} className="dashboard-membre-card">
                <div className="dashboard-membre-avatar">
                  {m.pseudo?.charAt(0).toUpperCase()}
                </div>
                <div className="dashboard-membre-info">
                  <span className="dashboard-membre-pseudo">{m.pseudo}</span>
                  <span className="dashboard-membre-role">{m.role || "—"}</span>
                </div>
                <span className={`dashboard-membre-cat cat-${m.category}`}>
                  {m.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="dashboard-bottom-grid">

          {/* USERS */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>{lang === "fr" ? "Accès Intranet" : "Intranet Access"}</h2>
              <button className="dashboard-add-btn" onClick={() => { setUserForm({ pseudo: "", code: "", role: "Manager" }); setShowAddUser(true); }}>
                + {lang === "fr" ? "Ajouter" : "Add"}
              </button>
            </div>

            <div className="dashboard-users-table-wrap">
              <table className="dashboard-users-table">
                <thead>
                  <tr>
                    <th>{lang === "fr" ? "Pseudo" : "Username"}</th>
                    <th>{lang === "fr" ? "Rôle" : "Role"}</th>
                    <th>{lang === "fr" ? "Actions" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="dashboard-user-pseudo">{u.pseudo}</td>
                      <td>
                        <span className={`dashboard-role-badge ${roleColor(u.role)}`}>{u.role}</span>
                      </td>
                      <td>
                        <div className="dashboard-user-actions">
                          <button className="dashboard-edit-role-btn" onClick={() => { setEditUserRole(u); setNewRole(u.role); }}>
                            {lang === "fr" ? "Rôle" : "Role"}
                          </button>
                          <button className="dashboard-delete-btn" onClick={() => setDeleteUser(u)}>
                            {lang === "fr" ? "Supprimer" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANNONCES */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>{lang === "fr" ? "Dernières annonces" : "Latest news"}</h2>
            </div>
            <div className="dashboard-annonces">
              {annonces.length === 0 ? (
                <p className="dashboard-empty">{lang === "fr" ? "Aucune annonce" : "No announcements"}</p>
              ) : annonces.map((a) => {
                const cfg = typeConfig[a.type] || typeConfig["Annonce"];
                return (
                  <div key={a.id} className={`dashboard-annonce-card ${cfg.color}`}>
                    <div className="dashboard-annonce-top">
                      <span>{cfg.icon} {a.type}</span>
                      <span className="dashboard-annonce-date">
                        {new Date(a.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}
                      </span>
                    </div>
                    <p className="dashboard-annonce-titre">{a.titre}</p>
                    {a.contenu && <p className="dashboard-annonce-contenu">{a.contenu}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* VIDEOS */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>{lang === "fr" ? "Dernières vidéos" : "Latest videos"}</h2>
            </div>
            <div className="dashboard-videos">
              {latestVideos.map((v) => (
                <div key={v.id} className="dashboard-video-row">
                  <span className={`dashboard-video-type ${v.type === "Short" ? "badge-short" : "badge-video"}`}>
                    {v.type}
                  </span>
                  <span className="dashboard-video-titre">{v.titre}</span>
                  <span className="dashboard-video-vues">{(v.vues || 0).toLocaleString()} {lang === "fr" ? "vues" : "views"}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* POPUP AJOUTER USER */}
      {showAddUser && (
        <div className="dashboard-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddUser(false)}>
          <div className="dashboard-popup">
            <h2>{lang === "fr" ? "Ajouter un utilisateur" : "Add a user"}</h2>
            <div className="popup-fields">
              <input type="text" placeholder={lang === "fr" ? "Pseudo" : "Username"} value={userForm.pseudo} onChange={(e) => setUserForm({ ...userForm, pseudo: e.target.value })} />
              <input type="password" placeholder="Code" value={userForm.code} onChange={(e) => setUserForm({ ...userForm, code: e.target.value })} />
              <select className="popup-select" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="CEO">CEO</option>
                <option value="Director">Director</option>
                <option value="Manager">Manager</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <button className="popup-save" onClick={addUser}>{lang === "fr" ? "Ajouter" : "Add"}</button>
            <button className="popup-close" onClick={() => setShowAddUser(false)}>{lang === "fr" ? "Fermer" : "Close"}</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER ROLE */}
      {editUserRole && (
        <div className="dashboard-overlay" onClick={(e) => e.target === e.currentTarget && setEditUserRole(null)}>
          <div className="dashboard-popup">
            <h2>{lang === "fr" ? `Modifier le rôle de ${editUserRole.pseudo}` : `Edit ${editUserRole.pseudo}'s role`}</h2>
            <div className="popup-fields">
              <select className="popup-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="CEO">CEO</option>
                <option value="Director">Director</option>
                <option value="Manager">Manager</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <button className="popup-save" onClick={updateUserRole}>{lang === "fr" ? "Sauvegarder" : "Save"}</button>
            <button className="popup-close" onClick={() => setEditUserRole(null)}>{lang === "fr" ? "Fermer" : "Close"}</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER USER */}
      {deleteUser && (
        <div className="dashboard-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteUser(null)}>
          <div className="dashboard-popup dashboard-popup--delete">
            <h2>{lang === "fr" ? "Supprimer l'utilisateur ?" : "Delete user?"}</h2>
            <p>{lang === "fr" ? "Cette action est irréversible." : "This action is irreversible."}<br /><strong>{deleteUser.pseudo}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDeleteUser}>{lang === "fr" ? "Oui supprimer" : "Yes, delete"}</button>
            <button className="popup-close" onClick={() => setDeleteUser(null)}>{lang === "fr" ? "Annuler" : "Cancel"}</button>
          </div>
        </div>
      )}

    </section>
  );
}

export default Dashboard;
import React, { useEffect, useState } from "react";
import "../styles/equipe.css";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import { FaCrown, FaPlay, FaVideo, FaPlus, FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";

function Equipe() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [filterCat, setFilterCat] = useState("tous");
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { id: null, pseudo: "", role: "", category: "staff", image: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from("members").select("*").order("id", { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  const getAvatar = (url, pseudo) => {
    if (!url) return `https://ui-avatars.com/api/?name=${pseudo}&background=FDB628&color=111111`;
    if (url.includes("x.com/")) {
      const username = url.split("x.com/")[1].split("/")[0];
      return `https://unavatar.io/twitter/${username}`;
    }
    return url;
  };

  const addMember = async () => {
    await supabase.from("members").insert([{ pseudo: form.pseudo, role: form.role, category: form.category, image: form.image }]);
    setShowAdd(false); setForm(emptyForm); fetchMembers();
  };

  const openEdit = (member) => { setForm(member); setShowEdit(true); setMenuOpen(null); };

  const updateMember = async () => {
    await supabase.from("members").update({ pseudo: form.pseudo, role: form.role, category: form.category, image: form.image }).eq("id", form.id);
    setShowEdit(false); setForm(emptyForm); fetchMembers();
  };

  const deleteMember = async (id) => {
    await supabase.from("members").delete().eq("id", id);
    fetchMembers();
  };

  const staffs   = members.filter(m => m.category === "staff"   && (filterCat === "tous" || filterCat === "staff"));
  const players  = members.filter(m => m.category === "player"  && (filterCat === "tous" || filterCat === "player"));
  const contents = members.filter(m => m.category === "content" && (filterCat === "tous" || filterCat === "content"));

  const renderCards = (list) =>
    list.map((member) => (
      <div className="col-md-6 col-lg-4" key={member.id}>
        <div className="member-card">

          {canManage && (
            <button className="menu-btn" onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}>
              <FaEllipsisV />
            </button>
          )}

          {canManage && menuOpen === member.id && (
            <div className="member-menu">
              <button onClick={() => openEdit(member)}><FaEdit /> {t.equipe_modifier}</button>
              <button className="delete-btn" onClick={() => deleteMember(member.id)}><FaTrash /> {t.equipe_supprimer}</button>
            </div>
          )}

          <img src={getAvatar(member.image, member.pseudo)} alt={member.pseudo} className="member-img" />
          <h3>{member.pseudo}</h3>
          <p className="member-role">{member.role}</p>
        </div>
      </div>
    ));

  const CATS = [
    { key: "tous",    label: lang === "fr" ? "Tous"    : "All"     },
    { key: "staff",   label: lang === "fr" ? "Staff"   : "Staff"   },
    { key: "player",  label: lang === "fr" ? "Players" : "Players" },
    { key: "content", label: lang === "fr" ? "Content" : "Content" },
  ];

  return (
    <section className="team-page">
      <div className="container">

        <div className="team-header text-center">
          <p className="team-subtitle">{t.equipe_mini}</p>
          <h1 className="team-title">{t.equipe_title}</h1>
          <p className="team-text">{t.equipe_sub}</p>

          {canManage && (
            <button className="add-member-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
              <FaPlus /> {t.equipe_add}
            </button>
          )}
        </div>

        {/* FILTRES */}
        <div className="equipe-filters">
          {CATS.map(cat => (
            <button
              key={cat.key}
              className={`equipe-filter-btn ${filterCat === cat.key ? "active" : ""}`}
              onClick={() => setFilterCat(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <h3 className="text-white text-center">{t.equipe_loading}</h3>
        ) : (
          <>
            {(filterCat === "tous" || filterCat === "staff") && (
              <div className="team-section">
                <h2 className="section-title"><FaCrown /> {t.equipe_staff}</h2>
                <div className="row g-4">{renderCards(staffs)}</div>
              </div>
            )}
            {(filterCat === "tous" || filterCat === "player") && (
              <div className="team-section">
                <h2 className="section-title"><FaPlay /> {t.equipe_players}</h2>
                <div className="row g-4">{renderCards(players)}</div>
              </div>
            )}
            {(filterCat === "tous" || filterCat === "content") && (
              <div className="team-section">
                <h2 className="section-title"><FaVideo /> {t.equipe_content}</h2>
                <div className="row g-4">{renderCards(contents)}</div>
              </div>
            )}
          </>
        )}

        {canManage && showAdd && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>{t.equipe_add_title}</h3>
              <input type="text" placeholder={t.equipe_pseudo} value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} />
              <input type="text" placeholder={t.equipe_role} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="staff">{t.equipe_staff}</option>
                <option value="player">{t.equipe_players}</option>
                <option value="content">{t.equipe_content}</option>
              </select>
              <input type="text" placeholder={t.equipe_image} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <button className="save-btn" onClick={addMember}>{t.equipe_add}</button>
              <button className="close-btn" onClick={() => setShowAdd(false)}>{t.equipe_close}</button>
            </div>
          </div>
        )}

        {canManage && showEdit && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>{t.equipe_edit_title}</h3>
              <input type="text" value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} />
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="staff">{t.equipe_staff}</option>
                <option value="player">{t.equipe_players}</option>
                <option value="content">{t.equipe_content}</option>
              </select>
              <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <button className="save-btn" onClick={updateMember}>{t.equipe_save}</button>
              <button className="close-btn" onClick={() => setShowEdit(false)}>{t.equipe_close}</button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default Equipe;
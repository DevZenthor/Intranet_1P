import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaPen } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/profil.css";

function Profil() {
  const [userDB, setUserDB]             = useState(null);
  const [member, setMember]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showEdit, setShowEdit]         = useState(false);
  const [showCode, setShowCode]         = useState(false);
  const [showCodeEdit, setShowCodeEdit] = useState(false);
  const [form, setForm]                 = useState({ pseudo: "", code: "" });
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const { lang } = useLang();
  const t = translations[lang];

  const navigate  = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localUser) { navigate("/"); return; }
    loadProfil();
  }, []);

  async function loadProfil() {
    const { data: userData }   = await supabase.from("users").select("*").eq("pseudo", localUser.pseudo).single();
    const { data: memberData } = await supabase.from("members").select("*").eq("pseudo", localUser.pseudo).single();
    setUserDB(userData);
    setMember(memberData);
    setLoading(false);
  }

  function openEdit() {
    setForm({ pseudo: userDB?.pseudo || "", code: "" });
    setError(""); setSuccess(""); setShowCodeEdit(false); setShowEdit(true);
  }

  async function saveEdit() {
    setError(""); setSuccess("");
    if (!form.pseudo.trim()) { setError(t.profil_required); return; }
    const updates = { pseudo: form.pseudo.trim() };
    if (form.code.trim()) updates.code = form.code.trim();
    const { error: err } = await supabase.from("users").update(updates).eq("id", userDB.id);
    if (err) { setError(t.profil_error); return; }
    const updatedUser = { ...localUser, ...updates };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSuccess(t.profil_success);
    setShowEdit(false);
    loadProfil();
    setTimeout(() => window.location.reload(), 800);
  }

  const getAvatar = (url) => {
    if (!url) return null;
    if (url.includes("x.com/")) {
      const username = url.split("x.com/")[1].split("/")[0];
      return `https://unavatar.io/twitter/${username}`;
    }
    return url;
  };

  const roleColor = (role) => {
    if (role === "admin")    return "role-admin";
    if (role === "CEO")      return "role-ceo";
    if (role === "Director") return "role-director";
    if (role === "Manager")  return "role-manager";
    if (role === "Coach")    return "role-coach";
    return "role-default";
  };

  const categoryLabel = (cat) => {
    if (cat === "staff")   return "Staff";
    if (cat === "player")  return "Player";
    if (cat === "content") return "Content";
    return cat || "—";
  };

  if (loading) return (
    <section className="profil-page">
      <p className="profil-loading">{t.profil_loading}</p>
    </section>
  );

  const avatarUrl = member ? getAvatar(member.image) : null;

  return (
    <section className="profil-page">
      <div className="profil-particles" />

      <div className="profil-container">

        <p className="profil-mini">{t.profil_mini}</p>
        <h1 className="profil-title">{t.profil_title}</h1>

        <div className="profil-card">

          {/* AVATAR */}
          <div className="profil-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={localUser.pseudo} className="profil-avatar-img" />
            ) : (
              <div className="profil-avatar-letter">
                {localUser.pseudo?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* INFOS */}
          <div className="profil-infos">
            <h2 className="profil-pseudo">{userDB?.pseudo}</h2>
            <div className="profil-badges">
              <span className={`profil-role-badge ${roleColor(userDB?.role)}`}>{userDB?.role}</span>
              {member?.category && (
                <span className="profil-cat-badge">{categoryLabel(member.category)}</span>
              )}
            </div>
            {member?.role && <p className="profil-member-role">{member.role}</p>}
          </div>

          {/* STATS */}
          <div className="profil-stats">

            <div className="profil-stat">
              <span className="profil-stat-label">{t.profil_pseudo}</span>
              <span className="profil-stat-val">{userDB?.pseudo}</span>
            </div>

            <div className="profil-stat">
              <span className="profil-stat-label">{t.profil_code}</span>
              <div className="profil-code-wrap-display">
                <span className="profil-code-val">
                  {showCode ? userDB?.code : "••••••••"}
                </span>
                <button
                  className="profil-eye-btn"
                  onClick={() => setShowCode(!showCode)}
                  title={showCode ? "Masquer" : "Afficher"}
                >
                  {showCode ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="profil-stat">
              <span className="profil-stat-label">{t.profil_role}</span>
              <span className="profil-stat-val">{userDB?.role}</span>
            </div>

            <div className="profil-stat">
              <span className="profil-stat-label">{t.profil_cat}</span>
              <span className="profil-stat-val">{categoryLabel(member?.category)}</span>
            </div>

            <div className="profil-stat">
              <span className="profil-stat-label">{t.profil_role_eq}</span>
              <span className="profil-stat-val">{member?.role || "—"}</span>
            </div>

          </div>

          {success && <p className="profil-success">{success}</p>}

          <button className="profil-edit-btn" onClick={openEdit}>
            <FaPen />
            {lang === "fr" ? "Modifier mes infos" : "Edit my info"}
          </button>

        </div>
      </div>

      {/* POPUP MODIFIER */}
      {showEdit && (
        <div
          className="profil-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="profil-popup">
            <h2>{t.profil_edit_title}</h2>

            <div className="popup-fields">
              <label className="profil-label">{t.profil_pseudo}</label>
              <input
                type="text"
                placeholder={t.profil_new_pseudo}
                value={form.pseudo}
                onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
              />

              <label className="profil-label">{t.profil_new_code}</label>
              <div className="profil-code-wrap">
                <input
                  type={showCodeEdit ? "text" : "password"}
                  placeholder={t.profil_code_hint}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <button
                  className="profil-eye-btn"
                  onClick={() => setShowCodeEdit(!showCodeEdit)}
                  type="button"
                >
                  {showCodeEdit ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error   && <p className="profil-error">{error}</p>}
            {success && <p className="profil-success">{success}</p>}

            <button className="popup-save"  onClick={saveEdit}>{t.profil_save}</button>
            <button className="popup-close" onClick={() => setShowEdit(false)}>{t.profil_close}</button>
          </div>
        </div>
      )}

    </section>
  );
}

export default Profil;
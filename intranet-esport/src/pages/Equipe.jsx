import React, { useEffect, useState } from "react";
import "../styles/equipe.css";
import { supabase } from "../services/supabase";

import {
  FaCrown,
  FaPlay,
  FaVideo,
  FaPlus,
  FaEllipsisV,
  FaTrash,
  FaEdit
} from "react-icons/fa";

function Equipe() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [menuOpen, setMenuOpen] = useState(null);

  const emptyForm = {
    id: null,
    pseudo: "",
    role: "",
    category: "staff",
    image: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("id", { ascending: true });

    setMembers(data || []);
    setLoading(false);
  };

  const getAvatar = (url, pseudo) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${pseudo}&background=FDB628&color=111111`;
    }

    if (url.includes("x.com/")) {
      const username = url.split("x.com/")[1].split("/")[0];
      return `https://unavatar.io/twitter/${username}`;
    }

    return url;
  };

  /* AJOUTER */
  const addMember = async () => {
    await supabase.from("members").insert([{
      pseudo: form.pseudo,
      role: form.role,
      category: form.category,
      image: form.image
    }]);

    setShowAdd(false);
    setForm(emptyForm);
    fetchMembers();
  };

  /* OUVRIR MODIFIER */
  const openEdit = (member) => {
    setForm(member);
    setShowEdit(true);
    setMenuOpen(null);
  };

  /* SAUVEGARDE MODIF */
  const updateMember = async () => {
    await supabase
      .from("members")
      .update({
        pseudo: form.pseudo,
        role: form.role,
        category: form.category,
        image: form.image
      })
      .eq("id", form.id);

    setShowEdit(false);
    setForm(emptyForm);
    fetchMembers();
  };

  /* SUPPRIMER */
  const deleteMember = async (id) => {
    await supabase
      .from("members")
      .delete()
      .eq("id", id);

    fetchMembers();
  };

  const staffs = members.filter((m) => m.category === "staff");
  const players = members.filter((m) => m.category === "player");
  const contents = members.filter((m) => m.category === "content");

  const renderCards = (list) =>
    list.map((member) => (
      <div className="col-md-6 col-lg-4" key={member.id}>
        <div className="member-card">

          <button
            className="menu-btn"
            onClick={() =>
              setMenuOpen(menuOpen === member.id ? null : member.id)
            }
          >
            <FaEllipsisV />
          </button>

          {menuOpen === member.id && (
            <div className="member-menu">

              <button onClick={() => openEdit(member)}>
                <FaEdit /> Modifier
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteMember(member.id)}
              >
                <FaTrash /> Supprimer
              </button>

            </div>
          )}

          <img
            src={getAvatar(member.image, member.pseudo)}
            alt={member.pseudo}
            className="member-img"
          />

          <h3>{member.pseudo}</h3>
          <p className="member-role">{member.role}</p>

        </div>
      </div>
    ));

  return (
    <section className="team-page">
      <div className="container">

        <div className="team-header text-center">
          <p className="team-subtitle">ONE PRODIGE</p>
          <h1 className="team-title">Notre Équipe</h1>
          <p className="team-text">Gestion des membres.</p>

          <button
            className="add-member-btn"
            onClick={() => {
              setForm(emptyForm);
              setShowAdd(true);
            }}
          >
            <FaPlus /> Ajouter
          </button>
        </div>

        {loading ? (
          <h3 className="text-white text-center">
            Chargement...
          </h3>
        ) : (
          <>
            <div className="team-section">
              <h2 className="section-title"><FaCrown /> Staff</h2>
              <div className="row g-4">{renderCards(staffs)}</div>
            </div>

            <div className="team-section">
              <h2 className="section-title"><FaPlay /> Players</h2>
              <div className="row g-4">{renderCards(players)}</div>
            </div>

            <div className="team-section">
              <h2 className="section-title"><FaVideo /> Content</h2>
              <div className="row g-4">{renderCards(contents)}</div>
            </div>
          </>
        )}

        {/* POPUP AJOUTER */}
        {showAdd && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>Ajouter membre</h3>

              <input
                type="text"
                placeholder="Pseudo"
                value={form.pseudo}
                onChange={(e) =>
                  setForm({ ...form, pseudo: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Role"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              />

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="staff">Staff</option>
                <option value="player">Player</option>
                <option value="content">Content</option>
              </select>

              <input
                type="text"
                placeholder="Lien image / X"
                value={form.image}
                onChange={(e) =>
                  setForm({ ...form, image: e.target.value })
                }
              />

              <button className="save-btn" onClick={addMember}>
                Ajouter
              </button>

              <button
                className="close-btn"
                onClick={() => setShowAdd(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* POPUP MODIFIER */}
        {showEdit && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>Modifier membre</h3>

              <input
                type="text"
                value={form.pseudo}
                onChange={(e) =>
                  setForm({ ...form, pseudo: e.target.value })
                }
              />

              <input
                type="text"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              />

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="staff">Staff</option>
                <option value="player">Player</option>
                <option value="content">Content</option>
              </select>

              <input
                type="text"
                value={form.image}
                onChange={(e) =>
                  setForm({ ...form, image: e.target.value })
                }
              />

              <button
                className="save-btn"
                onClick={updateMember}
              >
                Sauvegarder
              </button>

              <button
                className="close-btn"
                onClick={() => setShowEdit(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default Equipe;
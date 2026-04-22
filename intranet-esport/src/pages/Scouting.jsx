import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/scouting.css";

function Scouting() {
  const [players, setPlayers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { lang } = useLang();
  const t = translations[lang];

  const [form, setForm] = useState({
    pseudo: "",
    age: "",
    nationality: "",
    nombre_de_pr: "",
    prix: "",
    manager: "",
    pov: "",
  });

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    const { data } = await supabase.from("scoutings").select("*");
    setPlayers(data || []);
  };

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ pseudo: "", age: "", nationality: "", nombre_de_pr: "", prix: "", manager: "", pov: "" });
    setOpenForm(true);
  };

  const openEdit = (player) => {
    setEditId(player.id);
    setForm(player);
    setOpenForm(true);
  };

  const savePlayer = async () => {
    const payload = {
      pseudo:       form.pseudo,
      age:          Number(form.age),
      nationality:  form.nationality,
      nombre_de_PR: Number(form.nombre_de_pr),
      prix:         Number(form.prix),
      manager:      form.manager,
      pov:          form.pov
    };

    let result;
    if (editId) {
      result = await supabase.from("scoutings").update(payload).eq("id", editId);
    } else {
      result = await supabase.from("scoutings").insert([payload]);
    }

    if (result.error) {
      alert(result.error.message);
      return;
    }

    setOpenForm(false);
    loadPlayers();
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    await supabase.from("scoutings").delete().eq("id", deleteId);
    setOpenDelete(false);
    loadPlayers();
  };

  return (
    <section className="scouting-page">
      <div className="container scouting-container">

        <p className="scouting-mini">{t.scouting_mini}</p>
        <h1 className="scouting-title">{t.scouting_title}</h1>
        <p className="scouting-subtitle">{t.scouting_sub}</p>

        <div className="top-actions">
          <button className="add-btn" onClick={openAdd}>
            {t.scouting_add}
          </button>
        </div>

        <div className="scouting-table-box">
          <table className="scouting-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{lang === "fr" ? "Pseudo"      : "Username"}</th>
                <th>{lang === "fr" ? "Age"          : "Age"}</th>
                <th>{lang === "fr" ? "Nation"       : "Nation"}</th>
                <th>PR</th>
                <th>{lang === "fr" ? "Prix"         : "Price"}</th>
                <th>{lang === "fr" ? "Actions"      : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="pseudo">{p.pseudo}</td>
                  <td>{p.age}</td>
                  <td>{p.nationality}</td>
                  <td className="gold">{p["nombre de PR"] || p.nombre_de_pr}</td>
                  <td>{p.prix}$</td>
                  <td>
                    <div className="action-box">
                      <button className="edit-btn" onClick={() => openEdit(p)}>
                        {lang === "fr" ? "Modifier" : "Edit"}
                      </button>
                      <button className="delete-btn" onClick={() => askDelete(p.id)}>
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

      {/* POPUP FORM */}
      {openForm && (
        <div className="popup-bg">
          <div className="popup-box">

            <h2>
              {editId
                ? (lang === "fr" ? "Modifier joueur"  : "Edit player")
                : (lang === "fr" ? "Ajouter joueur"   : "Add player")}
            </h2>

            <input name="pseudo"       placeholder={lang === "fr" ? "Pseudo"       : "Username"}    value={form.pseudo}       onChange={change} />
            <input name="age"          placeholder={lang === "fr" ? "Age"           : "Age"}         value={form.age}          onChange={change} />
            <input name="nationality"  placeholder={lang === "fr" ? "Nationalité"   : "Nationality"} value={form.nationality}  onChange={change} />
            <input name="nombre_de_pr" placeholder="PR"                                              value={form.nombre_de_pr} onChange={change} />
            <input name="prix"         placeholder={lang === "fr" ? "Prix"          : "Price"}       value={form.prix}         onChange={change} />
            <input name="manager"      placeholder="Manager"                                         value={form.manager}      onChange={change} />
            <input name="pov"          placeholder="POV"                                             value={form.pov}          onChange={change} />

            <button className="save-btn"   onClick={savePlayer}>
              {lang === "fr" ? "Sauvegarder" : "Save"}
            </button>
            <button className="cancel-btn" onClick={() => setOpenForm(false)}>
              {lang === "fr" ? "Fermer" : "Close"}
            </button>

          </div>
        </div>
      )}

      {/* POPUP DELETE */}
      {openDelete && (
        <div className="popup-bg">
          <div className="delete-box">

            <h2>{lang === "fr" ? "Supprimer joueur ?" : "Delete player?"}</h2>
            <p>{lang === "fr" ? "Cette action est irréversible." : "This action is irreversible."}</p>

            <button className="delete-confirm" onClick={confirmDelete}>
              {lang === "fr" ? "Oui supprimer" : "Yes, delete"}
            </button>
            <button className="cancel-btn" onClick={() => setOpenDelete(false)}>
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>

          </div>
        </div>
      )}

    </section>
  );
}

export default Scouting;
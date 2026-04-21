import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/scouting.css";

function Scouting() {
  const [players, setPlayers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    pseudo: "",
    age: "",
    nationality: "",
    nombre_de_pr: "",
    prix: "",
    manager: "",
    pov: "",
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const { data } = await supabase
      .from("scoutings")
      .select("*");

    setPlayers(data || []);
  };

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* AJOUT */

  const openAdd = () => {
    setEditId(null);

    setForm({
      pseudo: "",
      age: "",
      nationality: "",
      nombre_de_pr: "",
      prix: "",
      manager: "",
      pov: "",
    });

    setOpenForm(true);
  };

  /* MODIF */

  const openEdit = (player) => {
    setEditId(player.id);
    setForm(player);
    setOpenForm(true);
  };

  /* Save */

const savePlayer = async () => {
  const payload = {
    pseudo: form.pseudo,
    age: Number(form.age),
    nationality: form.nationality,
    nombre_de_PR: Number(form.nombre_de_pr),
    prix: Number(form.prix),
    manager: form.manager,
    pov: form.pov
  };

  let result;

  if (editId) {
    result = await supabase
      .from("scoutings")
      .update(payload)
      .eq("id", editId);
  } else {
    result = await supabase
      .from("scoutings")
      .insert([payload]);
  }

  if (result.error) {
    console.log(result.error);
    alert(result.error.message);
    return;
  }

  setOpenForm(false);
  loadPlayers();
};

  /* DELETE */

  const askDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    await supabase
      .from("scoutings")
      .delete()
      .eq("id", deleteId);

    setOpenDelete(false);
    loadPlayers();
  };

  return (
    <section className="scouting-page">
      <div className="container scouting-container">

        <p className="scouting-mini">
          ONE PRODIGE
        </p>

        <h1 className="scouting-title">
          Scouting
        </h1>

        <p className="scouting-subtitle">
          Gestion joueurs premium.
        </p>

        <div className="top-actions">
          <button
            className="add-btn"
            onClick={openAdd}
          >
            + Ajouter joueur
          </button>
        </div>

        <div className="scouting-table-box">
          <table className="scouting-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Pseudo</th>
                <th>Age</th>
                <th>Nation</th>
                <th>PR</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {players.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="pseudo">
                    {p.pseudo}
                  </td>
                  <td>{p.age}</td>
                  <td>{p.nationality}</td>
                  <td className="gold">
                    {p["nombre de PR"] ||
                      p.nombre_de_pr}
                  </td>
                  <td>{p.prix}$</td>

                  <td>
                    <div className="action-box">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEdit(p)
                        }
                      >
                        Modifier
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          askDelete(p.id)
                        }
                      >
                        Supprimer
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
                ? "Modifier joueur"
                : "Ajouter joueur"}
            </h2>

            <input
              name="pseudo"
              placeholder="Pseudo"
              value={form.pseudo}
              onChange={change}
            />

            <input
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={change}
            />

            <input
              name="nationality"
              placeholder="Nationalité"
              value={form.nationality}
              onChange={change}
            />

            <input
              name="nombre_de_pr"
              placeholder="PR"
              value={
                form.nombre_de_pr
              }
              onChange={change}
            />

            <input
              name="prix"
              placeholder="Prix"
              value={form.prix}
              onChange={change}
            />

            <input
              name="manager"
              placeholder="Manager"
              value={form.manager}
              onChange={change}
            />

            <input
              name="pov"
              placeholder="POV"
              value={form.pov}
              onChange={change}
            />

            <button
              className="save-btn"
              onClick={savePlayer}
            >
              Sauvegarder
            </button>

            <button
              className="cancel-btn"
              onClick={() =>
                setOpenForm(false)
              }
            >
              Fermer
            </button>

          </div>
        </div>
      )}

      {/* POPUP DELETE */}

      {openDelete && (
        <div className="popup-bg">
          <div className="delete-box">

            <h2>
              Supprimer joueur ?
            </h2>

            <p>
              Cette action est
              irréversible.
            </p>

            <button
              className="delete-confirm"
              onClick={
                confirmDelete
              }
            >
              Oui supprimer
            </button>

            <button
              className="cancel-btn"
              onClick={() =>
                setOpenDelete(false)
              }
            >
              Annuler
            </button>

          </div>
        </div>
      )}

    </section>
  );
}

export default Scouting;
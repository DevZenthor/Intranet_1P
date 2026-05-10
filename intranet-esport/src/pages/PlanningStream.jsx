import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import { FaPlus, FaEdit, FaTrash, FaTwitch } from "react-icons/fa";
import "../styles/planningstream.css";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const JOURS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function PlanningStream() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [deleteSlot, setDeleteSlot] = useState(null);
  const [semaine, setSemaine] = useState(getCurrentSemaine());
  const { lang } = useLang();

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { jour: "Lundi", streamer: "", heure: "", jeu: "Fortnite", nom_cup: "", semaine: semaine };
  const [form, setForm] = useState(emptyForm);

  function getCurrentSemaine() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
    return `${fmt(monday)} - ${fmt(sunday)}`;
  }

  useEffect(() => { loadSlots(); }, [semaine]);

  async function loadSlots() {
    const { data } = await supabase
      .from("planning_stream")
      .select("*")
      .eq("semaine", semaine);
    setSlots(data || []);
    setLoading(false);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function saveSlot() {
    if (!form.jour || !form.streamer) {
      alert(lang === "fr" ? "Jour et streamer requis" : "Day and streamer required");
      return;
    }

    const payload = { ...form, semaine };

    if (editSlot) {
      await supabase.from("planning_stream").update(payload).eq("id", editSlot.id);
      setEditSlot(null);
    } else {
      await supabase.from("planning_stream").insert([payload]);
    }

    setShowForm(false);
    setForm({ ...emptyForm, semaine });
    loadSlots();
  }

  async function confirmDelete() {
    await supabase.from("planning_stream").delete().eq("id", deleteSlot.id);
    setDeleteSlot(null);
    loadSlots();
  }

  function openEdit(slot) {
    setForm({ ...slot });
    setEditSlot(slot);
    setShowForm(true);
  }

  function getSlotForJour(jour) {
    return slots.filter(s => s.jour === jour);
  }

  const JOURS_DISPLAY = lang === "fr" ? JOURS : JOURS_EN;

  return (
    <section className="ps-page">
      <div className="ps-particles" />
      <div className="ps-container">

        <p className="ps-mini">ONE PRODIGE</p>
        <h1 className="ps-title">
          {lang === "fr" ? "Planning Stream" : "Stream Schedule"}
        </h1>
        <p className="ps-sub">
          {lang === "fr" ? "Planning hebdomadaire WebTV" : "Weekly WebTV schedule"}
        </p>

        {/* SEMAINE */}
        <div className="ps-semaine-wrap">
          <label className="ps-semaine-label">
            {lang === "fr" ? "Semaine :" : "Week:"}
          </label>
          <input
            type="text"
            className="ps-semaine-input"
            value={semaine}
            onChange={(e) => setSemaine(e.target.value)}
            placeholder="ex: 27/04 - 03/05"
          />
        </div>

        {/* HEADER ACTIONS */}
        {canManage && (
          <div className="ps-actions">
            <button
              className="ps-add-btn"
              onClick={() => { setForm({ ...emptyForm, semaine }); setEditSlot(null); setShowForm(true); }}
            >
              <FaPlus /> {lang === "fr" ? "Ajouter un stream" : "Add a stream"}
            </button>
          </div>
        )}

        {/* GRILLE SEMAINE */}
        {loading ? (
          <p className="ps-loading">{lang === "fr" ? "Chargement..." : "Loading..."}</p>
        ) : (
          <div className="ps-grid">
            {JOURS.map((jour, i) => {
              const jourSlots = getSlotForJour(jour);
              const isEmpty = jourSlots.length === 0;

              return (
                <div key={jour} className={`ps-day-col ${!isEmpty ? "ps-day-col--active" : ""}`}>
                  <div className="ps-day-header">
                    {JOURS_DISPLAY[i].toUpperCase()}
                  </div>

                  <div className="ps-day-body">
                    {isEmpty ? (
                      <div className="ps-offline">
                        {"OFFLINE".split("").map((l, i) => (
                          <span key={i}>{l}</span>
                        ))}
                      </div>
                    ) : (
                      jourSlots.map(slot => (
                        <div key={slot.id} className="ps-slot">
                          {slot.heure && (
                            <div className="ps-slot-heure">{slot.heure}</div>
                          )}
                          <div className="ps-slot-streamer">
                            <FaTwitch className="ps-twitch-icon" />
                            {slot.streamer}
                          </div>
                          {slot.nom_cup && (
                            <div className="ps-slot-cup">{slot.nom_cup}</div>
                          )}
                          {slot.jeu && (
                            <div className="ps-slot-jeu">{slot.jeu}</div>
                          )}
                          {canManage && (
                            <div className="ps-slot-actions">
                              <button className="ps-btn-edit" onClick={() => openEdit(slot)}>
                                <FaEdit />
                              </button>
                              <button className="ps-btn-delete" onClick={() => setDeleteSlot(slot)}>
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* POPUP FORM */}
      {showForm && (
        <div className="ps-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="ps-popup">
            <h2>
              {editSlot
                ? (lang === "fr" ? "Modifier le stream" : "Edit stream")
                : (lang === "fr" ? "Ajouter un stream" : "Add a stream")}
            </h2>

            <div className="popup-fields">
              <select name="jour" value={form.jour} onChange={handleChange} className="popup-select">
                {JOURS.map((j, i) => (
                  <option key={j} value={j}>{JOURS_DISPLAY[i]}</option>
                ))}
              </select>

              <input
                name="streamer"
                type="text"
                placeholder={lang === "fr" ? "Pseudo du streamer" : "Streamer username"}
                value={form.streamer || ""}
                onChange={handleChange}
              />

              <input
                name="heure"
                type="time"
                value={form.heure || ""}
                onChange={handleChange}
              />

              <input
                name="jeu"
                type="text"
                placeholder={lang === "fr" ? "Jeu (ex: Fortnite)" : "Game (ex: Fortnite)"}
                value={form.jeu || ""}
                onChange={handleChange}
              />

              <input
                name="nom_cup"
                type="text"
                placeholder={lang === "fr" ? "Nom de la cup / event" : "Cup / event name"}
                value={form.nom_cup || ""}
                onChange={handleChange}
              />
            </div>

            <button className="popup-save" onClick={saveSlot}>
              {lang === "fr" ? "Sauvegarder" : "Save"}
            </button>
            <button className="popup-close" onClick={() => setShowForm(false)}>
              {lang === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deleteSlot && (
        <div className="ps-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteSlot(null)}>
          <div className="ps-popup ps-popup--delete">
            <h2>{lang === "fr" ? "Supprimer ?" : "Delete?"}</h2>
            <p>
              {lang === "fr" ? "Cette action est irréversible." : "This action is irreversible."}<br />
              <strong>{deleteSlot.jour} — {deleteSlot.streamer}</strong>
            </p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>
              {lang === "fr" ? "Oui supprimer" : "Yes, delete"}
            </button>
            <button className="popup-close" onClick={() => setDeleteSlot(null)}>
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

export default PlanningStream;
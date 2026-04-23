import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import { FaTwitch, FaYoutube, FaTrophy, FaPlus } from "react-icons/fa";
import "../styles/planning.css";

const TYPES = ["Stream", "Youtube", "Tournoi"];

const TYPE_CONFIG = {
  Stream:  { icon: <FaTwitch />,  color: "type-stream",  bg: "rgba(100,180,255,0.15)", border: "rgba(100,180,255,0.4)", dot: "#64b4ff" },
  Youtube: { icon: <FaYoutube />, color: "type-youtube", bg: "rgba(255,80,80,0.15)",   border: "rgba(255,80,80,0.4)",   dot: "#ff5050" },
  Tournoi: { icon: <FaTrophy />,  color: "type-tournoi", bg: "rgba(253,182,40,0.15)",  border: "rgba(253,182,40,0.4)",  dot: "#FDB628" },
};

const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const JOURS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const JOURS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function Planning() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const { lang } = useLang();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear]   = useState(now.getFullYear());

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  const emptyForm = { titre: "", date: "", heure: "", type: "Stream", description: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    const { data } = await supabase.from("planning").select("*").order("date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addEvent() {
    if (!form.titre || !form.date || !form.type) {
      alert(lang === "fr" ? "Titre, date et type requis" : "Title, date and type required");
      return;
    }
    await supabase.from("planning").insert([form]);
    setShowAdd(false); setForm(emptyForm); loadEvents();
  }

  async function updateEvent() {
    await supabase.from("planning").update(form).eq("id", editEvent.id);
    setEditEvent(null); setForm(emptyForm); loadEvents();
  }

  async function confirmDelete() {
    await supabase.from("planning").delete().eq("id", deleteEvent.id);
    setDeleteEvent(null); setSelectedDay(null); loadEvents();
  }

  function openEdit(e) { setForm({ ...e }); setEditEvent(e); }

  const MOIS  = lang === "fr" ? MOIS_FR  : MOIS_EN;
  const JOURS = lang === "fr" ? JOURS_FR : JOURS_EN;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay  = new Date(currentYear, currentMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDay(day) {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  }

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const isToday = (day) =>
    day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();

  return (
    <section className="planning-page">
      <div className="planning-particles" />

      <div className="planning-container">

        <p className="planning-mini">ONE PRODIGE</p>
        <h1 className="planning-title">{lang === "fr" ? "Planning" : "Schedule"}</h1>
        <p className="planning-sub">{lang === "fr" ? "Streams, YouTube et tournois" : "Streams, YouTube and tournaments"}</p>

        {/* LEGENDE */}
        <div className="planning-legend">
          {TYPES.map(type => {
            const cfg = TYPE_CONFIG[type];
            return (
              <div key={type} className="planning-legend-item">
                <span className="planning-legend-dot" style={{ background: cfg.dot }} />
                <span className={`planning-legend-icon ${cfg.color}`}>{cfg.icon}</span>
                <span>{type}</span>
              </div>
            );
          })}
          {canManage && (
            <button className="planning-add-btn" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
              <FaPlus /> {lang === "fr" ? "Ajouter" : "Add"}
            </button>
          )}
        </div>

        {/* NAV MOIS */}
        <div className="planning-nav">
          <button className="planning-nav-btn" onClick={prevMonth}>←</button>
          <h2 className="planning-month">{MOIS[currentMonth]} {currentYear}</h2>
          <button className="planning-nav-btn" onClick={nextMonth}>→</button>
        </div>

        {loading ? (
          <p className="planning-loading">{lang === "fr" ? "Chargement..." : "Loading..."}</p>
        ) : (
          <div className="planning-calendar-wrap">

            <div className="planning-weekdays">
              {JOURS.map(j => <div key={j} className="planning-weekday">{j}</div>)}
            </div>

            <div className="planning-grid">
              {cells.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = day === selectedDay;
                const today = isToday(day);

                return (
                  <div
                    key={i}
                    className={`planning-cell
                      ${!day ? "planning-cell--empty" : ""}
                      ${today ? "planning-cell--today" : ""}
                      ${isSelected ? "planning-cell--selected" : ""}
                      ${day ? "planning-cell--clickable" : ""}
                    `}
                    onClick={() => day && setSelectedDay(isSelected ? null : day)}
                  >
                    {day && (
                      <>
                        <span className="planning-day-num">{day}</span>
                        <div className="planning-dots">
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <span
                              key={idx}
                              className="planning-dot"
                              style={{ background: TYPE_CONFIG[e.type]?.dot || "#FDB628" }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="planning-dot-more">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* DETAIL DU JOUR */}
        {selectedDay && (
          <div className="planning-detail">
            <h3 className="planning-detail-title">
              {selectedDay} {MOIS[currentMonth]} {currentYear}
            </h3>

            {selectedEvents.length === 0 ? (
              <p className="planning-detail-empty">
                {lang === "fr" ? "Aucun événement ce jour." : "No events this day."}
              </p>
            ) : (
              <div className="planning-detail-list">
                {selectedEvents.map((e) => {
                  const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG["Stream"];
                  return (
                    <div key={e.id} className="planning-event-card" style={{ borderColor: cfg.border, background: cfg.bg }}>
                      <div className="planning-event-top">
                        <div className="planning-event-info">
                          <span className={`planning-event-icon-wrap ${cfg.color}`}>{cfg.icon}</span>
                          <span className={`planning-event-type ${cfg.color}`}>{e.type}</span>
                          {e.heure && <span className="planning-event-heure">🕐 {e.heure}</span>}
                        </div>
                        {canManage && (
                          <div className="planning-event-actions">
                            <button className="btn-edit" onClick={() => openEdit(e)}>
                              {lang === "fr" ? "Modifier" : "Edit"}
                            </button>
                            <button className="btn-delete" onClick={() => setDeleteEvent(e)}>
                              {lang === "fr" ? "Supprimer" : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                      <h4 className="planning-event-titre">{e.titre}</h4>
                      {e.description && <p className="planning-event-desc">{e.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {canManage && (
              <button
                className="planning-add-day-btn"
                onClick={() => { setForm({ ...emptyForm, date: selectedDateStr }); setShowAdd(true); }}
              >
                <FaPlus /> {lang === "fr" ? "Ajouter un événement ce jour" : "Add event this day"}
              </button>
            )}
          </div>
        )}

      </div>

      {/* POPUP AJOUTER */}
      {showAdd && (
        <div className="planning-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="planning-popup">
            <h2>{lang === "fr" ? "Ajouter un événement" : "Add an event"}</h2>
            <EventForm form={form} onChange={handleChange} lang={lang} />
            <button className="popup-save" onClick={addEvent}>{lang === "fr" ? "Sauvegarder" : "Save"}</button>
            <button className="popup-close" onClick={() => setShowAdd(false)}>{lang === "fr" ? "Fermer" : "Close"}</button>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editEvent && (
        <div className="planning-overlay" onClick={(e) => e.target === e.currentTarget && setEditEvent(null)}>
          <div className="planning-popup">
            <h2>{lang === "fr" ? "Modifier l'événement" : "Edit event"}</h2>
            <EventForm form={form} onChange={handleChange} lang={lang} />
            <button className="popup-save" onClick={updateEvent}>{lang === "fr" ? "Sauvegarder" : "Save"}</button>
            <button className="popup-close" onClick={() => setEditEvent(null)}>{lang === "fr" ? "Fermer" : "Close"}</button>
          </div>
        </div>
      )}

      {/* POPUP SUPPRIMER */}
      {deleteEvent && (
        <div className="planning-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteEvent(null)}>
          <div className="planning-popup planning-popup--delete">
            <h2>{lang === "fr" ? "Supprimer l'événement ?" : "Delete event?"}</h2>
            <p>{lang === "fr" ? "Cette action est irréversible." : "This action is irreversible."}<br /><strong>{deleteEvent.titre}</strong></p>
            <button className="popup-confirm-delete" onClick={confirmDelete}>{lang === "fr" ? "Oui supprimer" : "Yes, delete"}</button>
            <button className="popup-close" onClick={() => setDeleteEvent(null)}>{lang === "fr" ? "Annuler" : "Cancel"}</button>
          </div>
        </div>
      )}

    </section>
  );
}

function EventForm({ form, onChange, lang }) {
  return (
    <div className="popup-fields">
      <input
        name="titre"
        type="text"
        placeholder={lang === "fr" ? "Titre de l'événement" : "Event title"}
        value={form.titre || ""}
        onChange={onChange}
      />
      <select name="type" value={form.type || "Stream"} onChange={onChange} className="popup-select">
        <option value="Stream">Stream</option>
        <option value="Youtube">YouTube</option>
        <option value="Tournoi">Tournoi</option>
      </select>
      <input name="date" type="date" value={form.date || ""} onChange={onChange} />
      <input name="heure" type="time" value={form.heure || ""} onChange={onChange} />
      <textarea
        name="description"
        placeholder={lang === "fr" ? "Description (optionnel)" : "Description (optional)"}
        value={form.description || ""}
        onChange={onChange}
        rows={3}
      />
    </div>
  );
}

export default Planning;
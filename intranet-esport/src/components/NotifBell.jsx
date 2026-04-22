import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import "../styles/notifbell.css";

function NotifBell() {
  const [annonces, setAnnonces] = useState([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(
    localStorage.getItem("notif_last_seen") || "1970-01-01"
  );
  const ref = useRef(null);
  const { lang } = useLang();

  useEffect(() => {
    loadAnnonces();
    // Ferme si clic dehors
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadAnnonces() {
    const { data } = await supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setAnnonces(data || []);
  }

  function markAsSeen() {
    const now = new Date().toISOString();
    localStorage.setItem("notif_last_seen", now);
    setLastSeen(now);
    setOpen(false);
  }

  const unread = annonces.filter(a => new Date(a.created_at) > new Date(lastSeen)).length;

  const typeIcon = {
    "Annonce":      "📢",
    "Recrue":       "✅",
    "Leave":        "👋",
    "Announcement": "📢",
    "Signing":      "✅",
  };

  function formatDate(str) {
    return new Date(str).toLocaleDateString(
      lang === "fr" ? "fr-FR" : "en-GB",
      { day: "2-digit", month: "short" }
    );
  }

  return (
    <div className="notif-wrap" ref={ref}>
      <button
        className="notif-btn"
        onClick={() => setOpen(!open)}
        title={lang === "fr" ? "Notifications" : "Notifications"}
      >
        <FaBell />
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>{lang === "fr" ? "Notifications" : "Notifications"}</span>
            {unread > 0 && (
              <button className="notif-mark-btn" onClick={markAsSeen}>
                {lang === "fr" ? "Tout marquer lu" : "Mark all read"}
              </button>
            )}
          </div>

          <div className="notif-list">
            {annonces.length === 0 ? (
              <p className="notif-empty">
                {lang === "fr" ? "Aucune notification" : "No notifications"}
              </p>
            ) : annonces.map((a) => {
              const isNew = new Date(a.created_at) > new Date(lastSeen);
              return (
                <div key={a.id} className={`notif-item ${isNew ? "notif-item--new" : ""}`}>
                  <span className="notif-icon">{typeIcon[a.type] || "📢"}</span>
                  <div className="notif-content">
                    <p className="notif-titre">{a.titre}</p>
                    <span className="notif-date">{formatDate(a.created_at)}</span>
                  </div>
                  {isNew && <span className="notif-dot" />}
                </div>
              );
            })}
          </div>

          <Link to="/annonces" className="notif-footer" onClick={() => { markAsSeen(); }}>
            {lang === "fr" ? "Voir toutes les annonces →" : "See all announcements →"}
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotifBell;
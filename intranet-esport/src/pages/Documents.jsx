import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useLang } from "../context/LanguageContext";
import translations from "../context/translations";
import "../styles/documents.css";

function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const { lang } = useLang();
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user && ["admin", "CEO", "Director"].includes(user.role);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("id", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  }

  async function addDocument() {
    if (!title || !category || !file) {
      alert(lang === "fr" ? "Remplis tout" : "Fill in all fields");
      return;
    }

    const fileName = Date.now() + "_" + file.name;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) {
      alert(lang === "fr" ? "Erreur upload" : "Upload error");
      return;
    }

    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);

    await supabase.from("documents").insert([{
      title,
      category,
      file_url:   data.publicUrl,
      file_name:  file.name,
      created_by: user?.pseudo,
      created_at: new Date().toLocaleString()
    }]);

    setOpenAdd(false);
    setTitle("");
    setCategory("");
    setFile(null);
    loadDocs();
  }

  async function deleteDoc(id) {
    await supabase.from("documents").delete().eq("id", id);
    setConfirmDelete(null);
    loadDocs();
  }

  return (
    <section className="documents-page">

      <div className="documents-overlay" />

      <div className="documents-container">

        <p className="documents-mini">{t.docs_mini}</p>
        <h1>{t.docs_title}</h1>
        <p className="documents-sub">{t.docs_sub}</p>

        {canManage && (
          <button className="add-btn" onClick={() => setOpenAdd(true)}>
            {t.docs_add}
          </button>
        )}

        {loading ? (
          <p className="loading">{t.docs_loading}</p>
        ) : (
          <div className="docs-grid">
            {docs.map((doc) => (
              <div key={doc.id} className="doc-card">

                <h3>{doc.title}</h3>
                <span>{doc.category}</span>
                <p>{doc.file_name}</p>

                <div className="doc-actions">

                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="open-btn"
                  >
                    {t.docs_ouvrir}
                  </a>

                  <a
                    href={doc.file_url}
                    download
                    className="download-btn"
                  >
                    {t.docs_telecharger}
                  </a>

                  {canManage && (
                    <button
                      className="delete-btn"
                      onClick={() => setConfirmDelete(doc)}
                    >
                      {t.docs_supprimer}
                    </button>
                  )}

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* POPUP AJOUT */}
      {openAdd && (
        <div className="popup-bg">
          <div className="popup-box">

            <h2>{t.docs_add_title}</h2>

            <input
              placeholder={t.docs_titre}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder={t.docs_categorie}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button className="save-btn" onClick={addDocument}>
              {t.docs_save}
            </button>

            <button className="close-btn" onClick={() => setOpenAdd(false)}>
              {t.docs_close}
            </button>

          </div>
        </div>
      )}

      {/* POPUP DELETE */}
      {confirmDelete && (
        <div className="popup-bg">
          <div className="popup-box delete-pop">

            <h2>{t.docs_del_title}</h2>
            <p>{confirmDelete.title}</p>

            <div className="delete-row">
              <button
                className="delete-btn"
                onClick={() => deleteDoc(confirmDelete.id)}
              >
                {t.docs_oui}
              </button>

              <button
                className="close-btn"
                onClick={() => setConfirmDelete(null)}
              >
                {t.docs_annuler}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default Documents;
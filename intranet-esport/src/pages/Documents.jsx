import React, {
  useEffect,
  useState
} from "react";

import { supabase } from "../services/supabase";
import "../styles/documents.css";

function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [openAdd, setOpenAdd] =
    useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [file, setFile] =
    useState(null);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const canManage =
    user &&
    ["admin", "CEO", "Director"].includes(
      user.role
    );

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("id", {
        ascending: false
      });

    setDocs(data || []);
    setLoading(false);
  }

  async function addDocument() {
    if (!title || !category || !file) {
      alert("Remplis tout");
      return;
    }

    const fileName =
      Date.now() + "_" + file.name;

    const { error: uploadError } =
      await supabase.storage
        .from("documents")
        .upload(fileName, file);

    if (uploadError) {
      alert("Erreur upload");
      return;
    }

    const { data } =
      supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

    await supabase
      .from("documents")
      .insert([
        {
          title,
          category,
          file_url:
            data.publicUrl,
          file_name:
            file.name,
          created_by:
            user?.pseudo,
          created_at:
            new Date().toLocaleString()
        }
      ]);

    setOpenAdd(false);
    setTitle("");
    setCategory("");
    setFile(null);

    loadDocs();
  }

  async function deleteDoc(id) {
    await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    setConfirmDelete(null);
    loadDocs();
  }

  return (
    <section className="documents-page">

      <div className="documents-overlay" />

      <div className="documents-container">

        <p className="documents-mini">
          ONE PRODIGE
        </p>

        <h1>
          Documents
        </h1>

        <p className="documents-sub">
          Contrats & PDFs internes.
        </p>

        {canManage && (
          <button
            className="add-btn"
            onClick={() =>
              setOpenAdd(true)
            }
          >
            + Ajouter document
          </button>
        )}

        {loading ? (
          <p className="loading">
            Chargement...
          </p>
        ) : (
          <div className="docs-grid">

            {docs.map((doc) => (
              <div
                key={doc.id}
                className="doc-card"
              >
                <h3>
                  {doc.title}
                </h3>

                <span>
                  {doc.category}
                </span>

                <p>
                  {doc.file_name}
                </p>

                <div className="doc-actions">

                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="open-btn"
                  >
                    Ouvrir
                  </a>

                  <a
                    href={doc.file_url}
                    download
                    className="download-btn"
                  >
                    Télécharger
                  </a>

                  {canManage && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        setConfirmDelete(
                          doc
                        )
                      }
                    >
                      Supprimer
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

            <h2>
              Ajouter document
            </h2>

            <input
              placeholder="Titre"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Catégorie"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setFile(
                  e.target.files[0]
                )
              }
            />

            <button
              className="save-btn"
              onClick={
                addDocument
              }
            >
              Ajouter
            </button>

            <button
              className="close-btn"
              onClick={() =>
                setOpenAdd(false)
              }
            >
              Fermer
            </button>

          </div>

        </div>
      )}

      {/* POPUP DELETE */}

      {confirmDelete && (
        <div className="popup-bg">

          <div className="popup-box delete-pop">

            <h2>
              Supprimer ?
            </h2>

            <p>
              {confirmDelete.title}
            </p>

            <div className="delete-row">

              <button
                className="delete-btn"
                onClick={() =>
                  deleteDoc(
                    confirmDelete.id
                  )
                }
              >
                Oui supprimer
              </button>

              <button
                className="close-btn"
                onClick={() =>
                  setConfirmDelete(
                    null
                  )
                }
              >
                Annuler
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default Documents;
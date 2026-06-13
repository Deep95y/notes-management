import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchNote, deleteNote, toggleNotePin } from "../services/api";
import { formatDate } from "../utils";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmDialog from "../components/ConfirmDialog";

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadNote() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchNote(id);
        setNote(data);
      } catch (err) {
        setError(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  async function handleDelete() {
    await deleteNote(id);
    navigate("/");
  }

  async function handleTogglePin() {
    try {
      const updated = await toggleNotePin(id, !note.pinned);
      setNote(updated);
    } catch (err) {
      setError(err.message || "Failed to update pin");
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading note..." />;
  }

  if (error && !note) {
    return (
      <section className="page">
        <ErrorMessage message={error} />
        <Link to="/" className="btn btn-secondary">
          Back to notes
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <Link to="/" className="back-link">
          ← Back to notes
        </Link>
        <div className="detail-actions">
          <button
            type="button"
            className={`btn btn-secondary ${note.pinned ? "btn-pinned" : ""}`}
            onClick={handleTogglePin}
          >
            {note.pinned ? "Unpin" : "Pin"}
          </button>
          <Link to={`/notes/${id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <article className={`note-detail ${note.pinned ? "note-detail-pinned" : ""}`}>
        <h1>{note.title}</h1>
        {note.tags?.length > 0 && (
          <div className="tag-list">
            {note.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="note-meta">
          <span>Created: {formatDate(note.createdAt)}</span>
          <span>Updated: {formatDate(note.updatedAt)}</span>
          {note.pinned && <span className="pinned-label">Pinned</span>}
        </div>
        <div className="note-content">
          {note.content ? (
            note.content.split("\n").map((line, i) => (
              <p key={i}>{line || "\u00A0"}</p>
            ))
          ) : (
            <p className="text-muted">No content</p>
          )}
        </div>
      </article>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete note?"
          message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </section>
  );
}

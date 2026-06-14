import { Link } from "react-router-dom";
import { formatDate, getPreview } from "../utils";

export default function NoteCard({ note, onDelete, onTogglePin }) {
  return (
    <article className={`note-card ${note.pinned ? "note-card-pinned" : ""}`}>
      <div className="note-card-body">
        <div className="note-card-top">
          <h2>
            <Link to={`/notes/${note.id}`}>{note.title}</Link>
          </h2>
          <button
            type="button"
            className={`pin-btn ${note.pinned ? "pin-btn-active" : ""}`}
            onClick={() => onTogglePin(note)}
            title={note.pinned ? "Unpin note" : "Pin note"}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            📌
          </button>
        </div>
        <p className="note-preview">{getPreview(note.content)}</p>
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
        </div>
      </div>
      <div className="note-card-actions">
        <Link to={`/notes/${note.id}/edit`} className="btn btn-secondary btn-sm">
          Edit
        </Link>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(note)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}


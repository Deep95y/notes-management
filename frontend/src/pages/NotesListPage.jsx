import { useCallback, useEffect, useState } from "react";
import { fetchNotes, fetchTags, deleteNote, toggleNotePin } from "../services/api";
import SearchBar from "../components/SearchBar";
import TagFilter from "../components/TagFilter";
import NoteCard from "../components/NoteCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmDialog from "../components/ConfirmDialog";

export default function NotesListPage() {
  const [notes, setNotes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [noteToDelete, setNoteToDelete] = useState(null);

  const loadNotes = useCallback(async (search = "", tag = "") => {
    setLoading(true);
    setError("");
    try {
      const [data, tags] = await Promise.all([
        fetchNotes(search, tag),
        fetchTags(),
      ]);
      setNotes(data);
      setAllTags(tags);
    } catch (err) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes(searchTerm, selectedTag);
  }, [loadNotes, searchTerm, selectedTag]);

  async function handleDeleteConfirm() {
    await deleteNote(noteToDelete.id);
    setNoteToDelete(null);
    await loadNotes(searchTerm, selectedTag);
  }

  async function handleTogglePin(note) {
    try {
      await toggleNotePin(note.id, !note.pinned);
      await loadNotes(searchTerm, selectedTag);
    } catch (err) {
      setError(err.message || "Failed to update pin");
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>All Notes</h1>
          <p className="page-subtitle">Pinned first, then sorted by most recently updated</p>
        </div>
      </div>

      <SearchBar onSearch={setSearchTerm} />
      <TagFilter
        tags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      <ErrorMessage message={error} onRetry={() => loadNotes(searchTerm, selectedTag)} />

      {loading ? (
        <LoadingSpinner message="Loading notes..." />
      ) : !error && notes.length === 0 ? (
        <EmptyState
          message={
            searchTerm || selectedTag
              ? "No notes match your filters."
              : "You have no notes yet. Create your first note!"
          }
          actionLabel={!searchTerm && !selectedTag ? "Create Note" : undefined}
          actionTo={!searchTerm && !selectedTag ? "/notes/new" : undefined}
        />
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={setNoteToDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

      {!loading && notes.length > 0 && (
        <p className="results-count">
          {notes.length} note{notes.length !== 1 ? "s" : ""} found
        </p>
      )}

      {noteToDelete && (
        <ConfirmDialog
          title="Delete note?"
          message={`Are you sure you want to delete "${noteToDelete.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setNoteToDelete(null)}
        />
      )}
    </section>
  );
}

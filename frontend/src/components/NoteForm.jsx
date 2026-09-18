import { useEffect, useRef, useState } from "react";

export const TAG_OPTIONS = ["work", "ideas", "personal"];

function tagFromList(tags) {
  const list = tags || [];
  const known = list.find((tag) => TAG_OPTIONS.includes(tag));
  return known || list[0] || "";
}

export default function NoteForm({
  initialValues = { title: "", content: "", tags: [] },
  onSubmit,
  submitLabel,
  noteId = null,
  autoSave = false,
  onAutoSave,
}) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [selectedTag, setSelectedTag] = useState(tagFromList(initialValues.tags));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const skipAutoSave = useRef(true);
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    setTitle(initialValues.title);
    setContent(initialValues.content);
    setSelectedTag(tagFromList(initialValues.tags));
    skipAutoSave.current = true;
  }, [initialValues.title, initialValues.content, initialValues.tags]);

  useEffect(() => {
    if (!autoSave || !noteId || !onAutoSave) return;

    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }

    if (!title.trim()) return;

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await onAutoSave({
          title: title.trim(),
          content: content.trim(),
          tags: selectedTag ? [selectedTag] : [],
        });
        setAutoSaveStatus("saved");
      } catch (err) {
        setAutoSaveStatus("error");
        setError(err.message || "Auto-save failed");
      }
    }, 1000);

    return () => clearTimeout(autoSaveTimer.current);
  }, [title, content, selectedTag, autoSave, noteId, onAutoSave]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title must not be empty");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTag ? [selectedTag] : [],
      });
    } catch (err) {
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}

      {autoSave && (
        <div className={`auto-save-status status-${autoSaveStatus}`}>
          {autoSaveStatus === "saving" && "Saving..."}
          {autoSaveStatus === "saved" && "All changes saved"}
          {autoSaveStatus === "error" && "Auto-save failed — use Save to retry"}
          {autoSaveStatus === "idle" && "Changes auto-save while you type"}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <select
          id="tags"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a category</option>
          {TAG_OPTIONS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
          {selectedTag && !TAG_OPTIONS.includes(selectedTag) && (
            <option value={selectedTag}>{selectedTag}</option>
          )}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={12}
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}


import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createNote, fetchNote, updateNote } from "../services/api";
import NoteForm from "../components/NoteForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function NoteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    async function loadNote() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchNote(id);
        setInitialValues({
          title: data.title,
          content: data.content,
          tags: data.tags || [],
        });
      } catch (err) {
        setError(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id, isEdit]);

  const handleAutoSave = useCallback(
    async (values) => {
      await updateNote(id, values);
    },
    [id]
  );

  async function handleSubmit(values) {
    if (isEdit) {
      await updateNote(id, values);
      navigate(`/notes/${id}`);
    } else {
      const created = await createNote(values);
      navigate(`/notes/${created.id}`);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading note..." />;
  }

  return (
    <section className="page">
      <div className="page-header">
        <Link to={isEdit ? `/notes/${id}` : "/"} className="back-link">
          ← {isEdit ? "Back to note" : "Back to notes"}
        </Link>
        <h1>{isEdit ? "Edit Note" : "Create Note"}</h1>
      </div>

      <ErrorMessage message={error} />

      {!error && (
        <NoteForm
          initialValues={initialValues || { title: "", content: "", tags: [] }}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? "Update Note" : "Create Note"}
          noteId={isEdit ? id : null}
          autoSave={isEdit}
          onAutoSave={handleAutoSave}
        />
      )}
    </section>
  );
}

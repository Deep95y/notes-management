import { Routes, Route, Link } from "react-router-dom";
import NotesListPage from "./pages/NotesListPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import NoteFormPage from "./pages/NoteFormPage";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            Notes Management
          </Link>
          <Link to="/notes/new" className="btn btn-primary">
            + New Note
          </Link>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<NotesListPage />} />
          <Route path="/notes/new" element={<NoteFormPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/notes/:id/edit" element={<NoteFormPage />} />
        </Routes>
      </main>
    </div>
  );
}


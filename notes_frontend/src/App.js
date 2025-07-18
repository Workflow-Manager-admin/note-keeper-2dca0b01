import React, { useState, useEffect } from "react";
import "./App.css";

// Theme color config from requirements
const COLORS = {
  accent: "#ffc107",
  primary: "#1976d2",
  secondary: "#424242",
  text: "#282c34",
  border: "#e9ecef",
  white: "#fff",
  background: "#f8f9fa",
};

// Utility to get API URL from env or fallback
function getApiBase() {
  // PUBLIC_INTERFACE
  // Returns the base API URL from environment variable or default.
  // For actual deployments, set REACT_APP_API_BASE in .env
  return process.env.REACT_APP_API_BASE || "/api";
}

// PUBLIC_INTERFACE
function App() {
  // State
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null = create, otherwise note object
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // Search filter
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredNotes(notes);
    } else {
      const lower = search.trim().toLowerCase();
      setFilteredNotes(
        notes.filter(
          (n) =>
            n.title.toLowerCase().includes(lower) ||
            n.content.toLowerCase().includes(lower)
        )
      );
    }
  }, [notes, search]);

  // API Calls (all endpoints placeholder, see README for how to wire up in backend)
  async function fetchNotes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/notes`);
      if (!res.ok) throw new Error("Failed to load notes.");
      const data = await res.json();
      setNotes(data || []);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function createNote(title, content) {
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to create note.");
      // Optionally get the new note: const created = await res.json();
      await fetchNotes();
    } catch (e) {
      setError(e.message || "Failed to create note.");
    }
  }

  // PUBLIC_INTERFACE
  async function updateNote(id, title, content) {
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update note.");
      await fetchNotes();
    } catch (e) {
      setError(e.message || "Failed to update note.");
    }
  }

  // PUBLIC_INTERFACE
  async function deleteNote(id) {
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note.");
      await fetchNotes();
    } catch (e) {
      setError(e.message || "Failed to delete note.");
    }
  }

  function openCreateModal() {
    setEditingNote(null);
    setModalTitle("");
    setModalContent("");
    setModalOpen(true);
  }

  function openEditModal(note) {
    setEditingNote(note);
    setModalTitle(note.title);
    setModalContent(note.content);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalTitle("");
    setModalContent("");
    setEditingNote(null);
  }

  async function handleModalSave(e) {
    e.preventDefault();
    if (!modalTitle.trim()) {
      setError("Title is required.");
      return;
    }
    if (editingNote) {
      await updateNote(editingNote.id, modalTitle, modalContent);
    } else {
      await createNote(modalTitle, modalContent);
    }
    closeModal();
  }

  function handleStartDelete(id) {
    setDeletingId(id);
  }

  function handleCancelDelete() {
    setDeletingId(null);
  }

  async function handleConfirmDelete() {
    await deleteNote(deletingId);
    setDeletingId(null);
  }

  // UI renderers

  function renderNavBar() {
    return (
      <nav
        style={{
          background: COLORS.primary,
          color: COLORS.white,
          padding: "0 1.5rem",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          zIndex: 2,
        }}
        className="navbar"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 1,
              marginRight: 8,
              color: COLORS.accent,
            }}
          >
            note
          </span>
          <span
            style={{
              fontWeight: 400,
              fontSize: 18,
              color: COLORS.white,
            }}
          >
            keeper
          </span>
        </div>
        <input
          style={{
            border: "none",
            outline: "none",
            borderRadius: 24,
            padding: "6px 16px",
            fontSize: 15,
            width: 200,
            background: COLORS.white,
            color: COLORS.text,
            boxShadow: "0 1px 8px 0px rgba(16,16,16,0.04)",
          }}
          type="search"
          aria-label="Search notes"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </nav>
    );
  }

  function renderNotesGrid() {
    if (loading) {
      return <div style={{ marginTop: 60, fontSize: 18 }}>Loading…</div>;
    }
    if ((filteredNotes || []).length === 0) {
      return (
        <div style={{ marginTop: 60, color: COLORS.secondary, fontSize: 18 }}>
          {notes.length === 0
            ? "No notes yet. Start by adding one!"
            : "No notes found for search."}
        </div>
      );
    }
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
          gap: 24,
          marginTop: 32,
          marginBottom: 96,
        }}
        className="notes-grid"
      >
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{
              background: COLORS.background,
              borderRadius: 14,
              border: `1px solid ${COLORS.border}`,
              boxShadow:
                "0 1.5px 8px 0px rgba(16,16,16,0.03), 0 0.5px 1px 0 #E9ECEF",
              padding: "22px 18px 14px 18px",
              minHeight: 158,
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
              transition: "box-shadow 0.15s",
              position: "relative",
            }}
            onClick={() => openEditModal(note)}
            tabIndex={0}
            aria-label={`Edit note titled ${note.title}`}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.primary,
                marginBottom: 7,
                opacity: 0.95,
                wordBreak: "break-all",
              }}
              className="note-title"
            >
              {note.title}
            </div>
            <div
              style={{
                color: COLORS.secondary,
                fontSize: 15,
                marginBottom: 8,
                minHeight: 54,
                overflow: "hidden",
                whiteSpace: "pre-line",
                textOverflow: "ellipsis",
              }}
              className="note-content"
            >
              {note.content.length > 120
                ? note.content.slice(0, 120) + "…"
                : note.content}
            </div>
            <button
              className="delete-btn"
              title="Delete Note"
              style={{
                position: "absolute",
                right: 14,
                top: 16,
                border: "none",
                background: "transparent",
                color: COLORS.secondary,
                fontSize: 19,
                padding: 6,
                zIndex: 3,
                cursor: "pointer",
                borderRadius: "50%",
                transition: "color 0.2s",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleStartDelete(note.id);
              }}
              tabIndex={0}
              aria-label="Delete note"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    );
  }

  function renderFloatingButton() {
    return (
      <button
        className="floating-btn"
        style={{
          position: "fixed",
          right: 32,
          bottom: 28,
          background: COLORS.accent,
          color: COLORS.primary,
          border: "none",
          width: 62,
          height: 62,
          fontSize: 32,
          fontWeight: 700,
          borderRadius: "50%",
          boxShadow:
            "0 2px 12px 0px rgba(44,44,44,0.18), 0 1.4px 3px 0 #E9ECEF",
          zIndex: 8,
          cursor: "pointer",
          transition: "background 0.22s, color 0.22s, transform 0.15s",
        }}
        onClick={openCreateModal}
        aria-label="Create new note"
        tabIndex={0}
      >
        +
      </button>
    );
  }

  function renderModal() {
    if (!modalOpen) return null;
    const isEdit = !!editingNote;
    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 22,
          background: "rgba(90,90,90,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={closeModal}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <form
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 360,
            maxWidth: "94vw",
            background: COLORS.white,
            borderRadius: 13,
            boxShadow: "0 4px 24px #AABBCC22",
            padding: "28px 18px 18px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            border: `1.5px solid ${COLORS.primary}`,
          }}
          onSubmit={handleModalSave}
        >
          <h2
            style={{
              fontWeight: 700,
              color: COLORS.primary,
              marginBottom: 5,
              fontSize: 20,
            }}
          >
            {isEdit ? "Edit Note" : "Create Note"}
          </h2>
          <input
            type="text"
            aria-label="Title"
            placeholder="Note title"
            style={{
              padding: "8px 12px",
              border: `1.3px solid ${COLORS.border}`,
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 500,
              outline: "none",
              marginBottom: 3,
            }}
            value={modalTitle}
            onChange={(e) => setModalTitle(e.target.value)}
            maxLength={80}
            data-testid="modal-title-input"
            required
          />
          <textarea
            aria-label="Content"
            placeholder="Write your note…"
            rows={5}
            style={{
              padding: "10px 12px",
              border: `1.3px solid ${COLORS.border}`,
              borderRadius: 6,
              fontSize: 15,
              minHeight: 78,
              resize: "vertical",
              outline: "none",
            }}
            value={modalContent}
            onChange={(e) => setModalContent(e.target.value)}
            maxLength={800}
            data-testid="modal-content-textarea"
            required
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                background: COLORS.secondary,
                color: COLORS.white,
                border: "none",
                borderRadius: 8,
                padding: "8px 22px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: COLORS.primary,
                color: COLORS.white,
                border: "none",
                borderRadius: 8,
                padding: "8px 22px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15,
              }}
              data-testid="modal-save-btn"
            >
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
          {error && (
            <div
              style={{
                fontSize: 15,
                color: "red",
                marginTop: 5,
                textAlign: "left",
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    );
  }

  function renderDeleteConfirm() {
    if (deletingId === null) return null;
    return (
      <div
        className="delete-confirm"
        style={{
          position: "fixed",
          zIndex: 50,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(34,34,34,0.09)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onClick={handleCancelDelete}
      >
        <div
          style={{
            width: 290,
            background: COLORS.white,
            borderRadius: 10,
            boxShadow: "0 2px 10px #AABBCC33",
            border: `1.5px solid ${COLORS.accent}`,
            padding: "28px 16px 17px 16px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 16, marginBottom: 18, color: COLORS.primary }}>
            Delete this note?
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={handleCancelDelete}
              style={{
                background: COLORS.secondary,
                color: COLORS.white,
                border: "none",
                borderRadius: 8,
                padding: "7px 18px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              style={{
                background: COLORS.accent,
                color: COLORS.primary,
                border: "none",
                borderRadius: 8,
                padding: "7px 18px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 15,
              }}
              data-testid="delete-confirm-btn"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderFooter() {
    return (
      <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          color: COLORS.secondary,
          fontSize: "15px",
          letterSpacing: 1,
        }}
      >
        Made with <span style={{ color: COLORS.accent }}>❤</span> for minimal notes &mdash;{" "}
        <a
          href="https://reactjs.org"
          style={{ color: COLORS.primary, textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          React
        </a>
      </footer>
    );
  }

  return (
    <div
      className="app-root"
      style={{
        fontFamily:
          "'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', Arial, sans-serif",
        background: COLORS.background,
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
      }}
    >
      {renderNavBar()}
      <div
        className="app-main"
        style={{
          maxWidth: 950,
          margin: "0 auto",
          padding: 24,
          paddingTop: 14,
          minHeight: "82vh",
        }}
      >
        {renderNotesGrid()}
      </div>
      {renderFloatingButton()}
      {renderModal()}
      {renderDeleteConfirm()}
      {renderFooter()}
    </div>
  );
}

export default App;

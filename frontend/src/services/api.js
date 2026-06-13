const API_BASE = "/api/notes";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

function buildQuery(search, tag) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (tag) params.set("tag", tag);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchNotes(search = "", tag = "") {
  const response = await fetch(`${API_BASE}${buildQuery(search, tag)}`);
  return handleResponse(response);
}

export async function fetchTags() {
  const response = await fetch(`${API_BASE}/tags`);
  return handleResponse(response);
}

export async function fetchNote(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse(response);
}

export async function createNote(note) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  return handleResponse(response);
}

export async function updateNote(id, note) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  return handleResponse(response);
}

export async function toggleNotePin(id, pinned) {
  const response = await fetch(`${API_BASE}/${id}/pin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pinned }),
  });
  return handleResponse(response);
}

export async function deleteNote(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

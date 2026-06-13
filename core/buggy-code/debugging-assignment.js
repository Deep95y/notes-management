const express = require("express");
const app = express();

app.use(express.json());

const users = [
  { id: 1, name: "Amit", email: "amit@test.com" },
  { id: 2, name: "Riya", email: "riya@test.com" },
];

const notes = [
  { id: 1, title: "Note 1", content: "Content 1", userId: 1 },
  { id: 2, title: "Note 2", content: "Content 2", userId: 2 },
];

let nextNoteId = 3;

app.get("/users", (req, res) => {
  const allUsers = users;
  res.send(allUsers);
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  res.send(user);
});

function getUserById(id) {
  const user = users.find((u) => u.id === Number(id));
  return user;
}

app.get("/notes/count", (req, res) => {
  const total = notes.length;
  res.send({ total });
});

async function fetchExternalData() {
  return { source: "external", data: "sample data" };
}

app.get("/external-data", async (req, res) => {
  try {
    const data = await fetchExternalData();
    res.send(data);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch external data" });
  }
});

app.get("/notes", (req, res) => {
  if (notes.length === 0) {
    console.log("No notes found");
  }
  res.send(notes);
});

function generateNoteId() {
  return nextNoteId++;
}

app.post("/notes", (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content) {
    return res.status(400).send({ error: "Invalid input" });
  }

  const newNote = {
    id: generateNoteId(),
    title,
    content,
    userId: Number(userId),
  };

  notes.push(newNote);
  res.status(201).send(newNote);
});

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const noteIndex = notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).send({ error: "Note not found" });
  }

  notes.splice(noteIndex, 1);
  res.send({ message: "Note deleted" });
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  user.name = name;
  res.send(user);
});

app.get("/user-notes/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const userNotes = notes.filter((n) => n.userId === userId);
  res.send(userNotes);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@test.com" && password === "123456") {
    res.send({ message: "Login successful" });
  } else {
    res.status(401).send({ message: "Invalid credentials" });
  }
});

app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  res.send({ name: user.name });
});

app.post("/sum", (req, res) => {
  const { a, b } = req.body;
  const total = Number(a) + Number(b);
  res.send({ total });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

function parseTags(tags) {
  if (!tags) return [];
  let parsed = [];
  if (Array.isArray(tags)) {
    parsed = tags.map((tag) => tag.trim());
  } else if (typeof tags === "string") {
    parsed = tags.split(",").map((tag) => tag.trim());
  }
  return parsed.filter(Boolean).map((tag) => tag.toLowerCase());
}

function formatNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    pinned: note.pinned || false,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    const query = {};

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { content: { $regex: term, $options: "i" } },
        { tags: { $regex: term, $options: "i" } },
      ];
    }

    if (tag && tag.trim()) {
      query.tags = tag.trim().toLowerCase();
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes.map(formatNote));
  } catch (err) {
    next(err);
  }
});

router.get("/tags", async (req, res, next) => {
  try {
    const tags = await Note.distinct("tags");
    res.json(tags.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(formatNote(note));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content, tags, pinned } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title must not be empty" });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content ? content.trim() : "",
      tags: parseTags(tags),
      pinned: Boolean(pinned),
    });

    res.status(201).json(formatNote(note));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { title, content, tags, pinned } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: "Title must not be empty" });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (tags !== undefined) note.tags = parseTags(tags);
    if (pinned !== undefined) note.pinned = Boolean(pinned);

    await note.save();
    res.json(formatNote(note));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/pin", async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (req.body.pinned !== undefined) {
      note.pinned = Boolean(req.body.pinned);
    } else {
      note.pinned = !note.pinned;
    }

    await note.save();
    res.json(formatNote(note));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const Room = require("../models/room");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

router.post("/send", upload.single("file"), async (req, res) => {
  try {
    const { roomId, sender, type, text } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    let task = {
      sender,
      type,
      createdAt: new Date(),
    };

    if (type === "text") {
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text content is required." });
      }
      task.content = text.trim();
    } else if (type === "file") {
      if (!req.file) {
        return res.status(400).json({ error: "File is required." });
      }
      task.filename = req.file.originalname;
      task.fileUrl = req.file.path; // or req.file.location if using cloud storage
    } else {
      return res.status(400).json({ error: "Invalid task type." });
    }

    room.tasks.push(task);
    await room.save();

    res.status(200).json({ message: "Task uploaded successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ messages: room.messages });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//Fetching Tasks
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json(room.tasks); // Only sending tasks
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
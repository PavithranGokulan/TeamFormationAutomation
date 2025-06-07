const express = require("express");
const router = express.Router();
const Room = require("../models/room");

function generateRoomId(roomName) {
    const prefix = roomName.trim().substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(100 + Math.random() * 900); // random 3-digit number
    return prefix + randomDigits;
}
  
// CREATE ROOM (Teacher)
router.post("/create", async (req, res) => {
    try {
      const { roomName, teacher, userId, description, department, year, image} = req.body;
  
      let roomId;
      let unique = false;
  
      // Retry until a unique roomId is found
      while (!unique) {
        roomId = generateRoomId(roomName);
        const existing = await Room.findOne({ roomId });
        if (!existing) unique = true;
      }
  
      const newRoom = new Room({roomName, roomId, teacher, userId, description, department, year, image, students: []});
      await newRoom.save();
  
      res.status(201).json({
        message: "Room created successfully",
        room: {
          roomId,
          teacher,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

// Join room
router.post("/join", async (req, res) => {
  try {
    const { roomId, userId, name, rollno, email } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const normalizedUserId = String(userId).trim();  // Normalize userId

    // Check if student already exists by userId
    const alreadyJoined = room.students.some(
      (student) => String(student.userId).trim() === normalizedUserId
    );

    if (alreadyJoined) {
      return res.status(400).json({ error: "Student already joined the room" });
    }

    // Add student to room
    room.students.push({ name, userId: normalizedUserId, rollno, email });
    await room.save();

    res.status(200).json({ message: "Joined room successfully", room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

  //to display Room Details
  router.get("/:roomId", async (req, res) => {
    try {
      const roomId = req.params.roomId;

      const room = await Room.findOne({ roomId });

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.status(200).json(room);
    } catch (err) {
      console.error("Error fetching room:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  //Fetch Rooms
  router.get("/user/:userId", async (req, res) => {
  try {
    const userId_ = req.params.userId;
    const rooms = await Room.find({
      $or: [
        { userId: userId_ },              // teacher's userId
        { "students.userId": userId_}           // match in students array
      ]
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// DELETE ROOM BY roomId
router.delete('/delete/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const deletedRoom = await Room.findOneAndDelete({ roomId });

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully', room: deletedRoom });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE task from room
router.delete('/taskdelete/:roomId/tasks/:taskId', async (req, res) => {
  const { roomId, taskId } = req.params;

  try {
    const room = await Room.findOneAndUpdate(
      { roomId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room or Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', room });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
const mongoose = require("mongoose");

const roomteamSchema = new mongoose.Schema({
  roomId: { type: String, required: true },  
  purpose: { type: String, required: true }, // New field
  teamId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  students: { type: Array, required: true },
  works: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Room_Teams", roomteamSchema);
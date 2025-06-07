const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  type: String,
  content: String,
  filename: String,
  createdAt: {
        type: Date,
        default: Date.now,
      },
});

const roomSchema = new mongoose.Schema({
  roomName: { type: String },
  roomId: { type: String, required: true, unique: true },
  teacher: { type: String, required: true },
  userId: { type: String, required: true },
  description: { type: String },
  department: { type: String },
  year: { type: String },
  image: { type: String },
  students: [
    {   
        userId: { type: String, required: true },
        name: String,
        rollno: String,
        email: String,
    },
],
messages: [messageSchema],
tasks: [
    {
      sender: { type: String, required: true }, // teacher name
      type: { type: String, enum: ['text', 'file'], required: true },
      content: { type: String }, // used for 'text' tasks
      filename: { type: String }, // used for 'file' tasks
      fileUrl: { type: String },  // used for 'file' tasks
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);

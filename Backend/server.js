const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const teamRoutes = require('./routes/team');
const roomRoutes = require("./routes/room");
const authRoutes = require("./routes/auth");
const userdetailsRoutes = require("./routes/user_details");
const uploadfileRoutes = require("./routes/upload_file");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

//Serve static files like uploaded files
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/Team_segregation_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

app.use("/api/auth", authRoutes);
app.use('/api', userdetailsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/tasks',uploadfileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
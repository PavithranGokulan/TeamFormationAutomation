const express = require("express");
const router = express.Router();
const User = require("../models/users");


router.get("/profile/:userid", async (req, res) => {
    try {
      const { userid } = req.params;
  
      const user = await User.findOne({ userid }).select("-_id -password -createdAt -updatedAt -__v");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ user });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  //Edit Profile 
  router.put("/edit/:userid", async (req, res) => {
  const { userid } = req.params;
  const updatedFields = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userid },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error updating user profile." });
  }
});

  module.exports = router;
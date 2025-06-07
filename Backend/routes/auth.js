const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
require('dotenv').config();


router.post("/signup", async (req, res) => {
    try {
      const { name, userid, email, password, cgpa, interests, skills, friends } = req.body;
      
      // Check for duplicate userid
      const existingUser = await User.findOne({ userid });
      if (existingUser) {
        return res.status(400).json({ error: "Duplicate userid" });
      }
  
      // Verify all friends' userids exist
      if (friends && friends.length > 0) {
        const existingFriends = await User.find({ userid: { $in: friends } }).select("userid");
        const existingFriendIds = existingFriends.map(u => u.userid);
        const invalidFriends = friends.filter(fid => !existingFriendIds.includes(fid));
  
        if (invalidFriends.length > 0) {
          return res.status(400).json({ error: `Invalid friend userids: ${invalidFriends.join(", ")}` });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create and save user
      const newUser = new User({
        name,
        userid,
        email,
        password: hashedPassword,
        cgpa,
        interests,
        skills,
        friends
      });
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully", user: newUser });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });  

router.post("/login", async (req, res) => {
  try {
    const { userid, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ userid });
    if (!user) {
      return res.status(404).json({ error: "User ID not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, userid: user.userid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        userid: user.userid,
        email: user.email,
        cgpa: user.cgpa,
        interests: user.interests,
        skills: user.skills,
        friends: user.friends,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

// ---------------- Code Ends Here ------------------- //


// router.post("/login", async (req, res) => {
//   try {
//     const { userid, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ userid });
//     if (!user) {
//       return res.status(404).json({ error: "User ID not found" });
//     }
//     // console.log(password,user.password);
//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     // Success
//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         name: user.name,
//         userid: user.userid,
//         email: user.email,
//         cgpa: user.cgpa,
//         interests: user.interests,
//         skills: user.skills,
//         friends: user.friends
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

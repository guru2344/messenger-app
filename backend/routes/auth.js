// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// // ================= REGISTER =================
// router.post("/register", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.json({ message: "All fields required" });
//   }

//   db.query(
//     "INSERT INTO users (username, password) VALUES (?, ?)",
//     [username, password],
//     (err) => {
//       if (err) return res.json({ message: "User exists" });
//       res.json({ message: "Registered successfully" });
//     }
//   );
// });

// // ================= LOGIN =================
// router.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   db.query(
//     "SELECT * FROM users WHERE username=?",
//     [username],
//     (err, result) => {

//       if (err) return res.json({ message: "DB error" });

//       if (result.length === 0) {
//         return res.json({ message: "User not found" });
//       }

//       if (password !== result[0].password) {
//         return res.json({ message: "Wrong password" });
//       }

//       res.json({ username: result[0].username });
//     }
//   );
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");

// ================= REGISTER =================
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ message: "All fields required" });
  }

  // First check if user already exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ message: "DB error" });
      }

      if (result.length > 0) {
        return res.json({ message: "User already exists" });
      }

      // Insert new user
      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err2) => {
          if (err2) {
            console.log(err2);
            return res.json({ message: "Register failed" });
          }

          res.json({ message: "Registered successfully" });
        }
      );
    }
  );
});

// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ message: "DB error" });
      }

      if (result.length === 0) {
        return res.json({ message: "User not found" });
      }

      if (password !== result[0].password) {
        return res.json({ message: "Wrong password" });
      }

      res.json({
        message: "Login successful",
        username: result[0].username
      });
    }
  );
});

module.exports = router;
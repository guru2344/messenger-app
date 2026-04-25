const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const multer = require("multer");
const db = require("./db");
require("dotenv").config();
app.use("/auth", require("./routes/auth"));

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONNECT AUTH ROUTES (🔥 THIS WAS MISSING)
app.use("/auth", require("./routes/auth"));

// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ filePath: req.file.filename });
});

// ================= GET ALL USERS =================
app.get("/users", (req, res) => {
  db.query("SELECT username FROM users", (err, result) => {
    if (err) return res.json([]);
    res.json(result);
  });
});

// ================= SOCKET =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let onlineUsers = {};

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    onlineUsers[username] = socket.id;
    io.emit("online_users", Object.keys(onlineUsers));
  });

  socket.on("send_message", (data) => {
    const receiverSocket = onlineUsers[data.receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", data);
    }

    socket.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    for (let user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
      }
    }
    io.emit("online_users", Object.keys(onlineUsers));
  });

});

// ================= START =================
server.listen(5000, () => {
  console.log("🚀 Server running on 5000");
});
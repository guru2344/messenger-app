import React, { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import socket from "./socket";
import axios from "axios";
import "./App.css";

const API = "https://messenger-app-0lmy.onrender.com";

function Chat({ user, logout }) {
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chats, setChats] = useState({});
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); // ✅ FIX (no reset issue)
  const bottomRef = useRef();

  // ================= INIT =================
  useEffect(() => {
    socket.emit("join", user.username);

    // GET USERS
    axios.get(`${API}/users`).then(res => {
      const filtered = res.data
        .map(u => u.username)
        .filter(u => u !== user.username);
      setAllUsers(filtered);
    });

    // ONLINE USERS
    socket.on("online_users", setOnlineUsers);

    // RECEIVE MESSAGE (NO DUPLICATE)
    socket.on("receive_message", (data) => {
      const otherUser =
        data.sender === user.username ? data.receiver : data.sender;

      setChats(prev => {
        const prevMsgs = prev[otherUser] || [];

        // ❌ prevent duplicate
        if (prevMsgs.some(m =>
          m.message === data.message &&
          m.file === data.file &&
          m.sender === data.sender
        )) {
          return prev;
        }

        return {
          ...prev,
          [otherUser]: [...prevMsgs, data]
        };
      });
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_message");
    };
  }, [user.username]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, receiver]);

  // ================= SEND =================
  const sendMessage = () => {
    if (!receiver) return alert("Select user first");
    if (!message && !file) return;

    const data = {
      sender: user.username,
      receiver,
      message,
      file
    };

    socket.emit("send_message", data);

    // ADD LOCALLY
    setChats(prev => ({
      ...prev,
      [receiver]: [...(prev[receiver] || []), data]
    }));

    setMessage("");
    setFile(null);
  };

  // ================= EMOJI =================
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  // ================= VOICE =================
  const toggleRecording = async () => {
    if (!receiver) return alert("Select user first");

    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        if (blob.size === 0) {
          alert("No audio recorded");
          return;
        }

        const form = new FormData();
        form.append("file", blob, "voice.webm");

        const res = await axios.post(`${API}/upload`, form);

        const data = {
          sender: user.username,
          receiver,
          message: "",
          file: res.data.filePath
        };

        socket.emit("send_message", data);

        setChats(prev => ({
          ...prev,
          [receiver]: [...(prev[receiver] || []), data]
        }));
      };

      mediaRecorder.start();
      setRecording(true);

    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ================= FILE =================
  const uploadFile = async (e) => {
    const form = new FormData();
    form.append("file", e.target.files[0]);

    const res = await axios.post(`${API}/upload`, form);
    setFile(res.data.filePath);
  };

  return (
    <div className="chat-app">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>Chats</h3>

        {allUsers.map((u, i) => (
          <div
            key={i}
            onClick={() => setReceiver(u)}
            className={`user-item ${receiver === u ? "active" : ""}`}
          >
            {onlineUsers.includes(u) ? "🟢" : "⚪"} {u}
          </div>
        ))}

        <button onClick={logout}>Logout</button>
      </div>

      {/* CHAT */}
      <div className="chat-container">

        <div className="chat-header">
          {receiver || "Select user"}
        </div>

        <div className="chat-body">
          {receiver &&
            chats[receiver]?.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.sender === user.username
                    ? "message sent"
                    : "message received"
                }
              >
                {msg.message && <p>{msg.message}</p>}

                {/* IMAGE */}
                {msg.file && msg.file.match(/\.(jpg|png|jpeg)$/) && (
                  <img src={`${API}/uploads/${msg.file}`} alt="" />
                )}

                {/* AUDIO */}
                {msg.file && msg.file.endsWith(".webm") && (
                  <audio controls src={`${API}/uploads/${msg.file}`} />
                )}

                {/* FILE */}
                {msg.file &&
                  !msg.file.match(/\.(jpg|png|jpeg|webm)$/) && (
                    <a href={`${API}/uploads/${msg.file}`} target="_blank" rel="noreferrer">
                      📎 File
                    </a>
                  )}
              </div>
            ))}

          <div ref={bottomRef} />
        </div>

        {/* FOOTER */}
        <div className="chat-footer" style={{ position: "relative" }}>

          <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <label className="file-btn">
            📎
            <input type="file" onChange={uploadFile} />
          </label>

          <button onClick={toggleRecording}>
            {recording ? "⏹️" : "🎤"}
          </button>

          <button onClick={sendMessage}>Send</button>

          {showEmoji && (
            <div style={{
              position: "absolute",
              bottom: "60px",
              right: "10px",
              zIndex: 1000
            }}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Chat;
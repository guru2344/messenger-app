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
  const chunksRef = useRef([]);
  const bottomRef = useRef();

  useEffect(() => {
    socket.emit("join", user.username);

    axios.get(`${API}/users`).then(res => {
      const filtered = res.data
        .map(u => u.username)
        .filter(u => u !== user.username);
      setAllUsers(filtered);
    });

    socket.on("online_users", setOnlineUsers);

    socket.on("receive_message", (data) => {
      const otherUser =
        data.sender === user.username ? data.receiver : data.sender;

      setChats(prev => ({
        ...prev,
        [otherUser]: [...(prev[otherUser] || []), data]
      }));
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_message");
    };
  }, [user.username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, receiver]);

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

    setChats(prev => ({
      ...prev,
      [receiver]: [...(prev[receiver] || []), data]
    }));

    setMessage("");
    setFile(null);
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const uploadFile = async (e) => {
    const form = new FormData();
    form.append("file", e.target.files[0]);

    const res = await axios.post(`${API}/upload`, form);
    setFile(res.data.filePath);
  };

  const toggleRecording = async () => {
    if (!receiver) return alert("Select user first");

    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

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
      };

      mediaRecorder.start();
      setRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="chat-app">

      <div className="sidebar">
        <h3>Chats</h3>

        {allUsers.map((u, i) => (
          <div
            key={i}
            onClick={() => setReceiver(u)}
            className={receiver === u ? "active" : ""}
          >
            {onlineUsers.includes(u) ? "🟢" : "⚪"} {u}
          </div>
        ))}

        <button onClick={logout}>Logout</button>
      </div>

      <div className="chat-container">

        <div className="chat-header">
          {receiver || "Select user"}
        </div>

        <div className="chat-body">
          {receiver &&
            chats[receiver]?.map((msg, i) => (
              <div key={i}>
                {msg.message && <p>{msg.message}</p>}
              </div>
            ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-footer">

          <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <input type="file" onChange={uploadFile} />

          <button onClick={toggleRecording}>
            {recording ? "⏹️" : "🎤"}
          </button>

          <button onClick={sendMessage}>Send</button>

          {showEmoji && (
            <EmojiPicker onEmojiClick={onEmojiClick} />
          )}

        </div>

      </div>
    </div>
  );
}

export default Chat;
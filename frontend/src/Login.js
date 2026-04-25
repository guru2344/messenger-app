import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // const handleAuth = async () => {
  //   const url = isLogin
  //     ? "http://localhost:5000/auth/login"
  //     : "http://localhost:5000/auth/register";

  //   const res = await axios.post(url, { username, password });

  //   if (res.data.message) {
  //     alert(res.data.message);
  //   } else {
  //     setUser({ username });
  //   }
  // };
const handleAuth = async () => {
  // const API = "https://messenger-app-0lmy.onrender.com";
  const API = "http://localhost:5000";


  // const url = isLogin
  //   ? `${API}/auth/login`
  //   : `${API}/auth/register`;
  const url = isLogin
  ? `${API}/auth/login`
  : `${API}/auth/register`;

  const res = await axios.post(url, {
    username: username.trim(),
    password: password.trim()
  });

  console.log(res.data);

  if (isLogin) {
    if (
      res.data.message === "Login successful" ||
      res.data.username
    ) {
      setUser({
        username: res.data.username || username
      });
    } else {
      alert(res.data.message);
    }
  } else {
    alert(res.data.message);
  }
};

  return (
  <div className="auth-container">
    <div className="card">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleAuth}>
        {isLogin ? "Login" : "Register"}
      </button>

      <p className="toggle" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create account" : "Already have account?"}
      </p>
    </div>
  </div>
);
}

export default Login;
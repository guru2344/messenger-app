import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register";

    const res = await axios.post(url, { username, password });

    if (res.data.message) {
      alert(res.data.message);
    } else {
      setUser({ username });
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
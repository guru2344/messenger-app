import React, { useState } from "react";
import axios from "axios";

const API = "https://messenger-app-0lmy.onrender.com";

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    try {
      const url = isLogin
        ? `${API}/auth/login`
        : `${API}/auth/register`;

      const res = await axios.post(url, { username, password });

      if (res.data.message) {
        alert(res.data.message);
      } else {
        setUser({ username: res.data.username });
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="login-box">
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

      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create account" : "Already have account?"}
      </p>
    </div>
  );
}

export default Login;
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <>
      {!user ? (
        <Login setUser={handleLogin} />
      ) : (
        <Chat user={user} logout={logout} />
      )}
    </>
  );
}

export default App;
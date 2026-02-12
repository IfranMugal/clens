import React, { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Change from "./pages/Change";
import ModelSuggestion from "./pages/ModelSuggestion";
import PromptOptimizer from "./pages/PromptOptimizer";
import EnterpriseBatch from "./pages/EnterpriseBatch";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPage("dashboard");
    setShowLogin(false);
  };

  // 1️⃣ If no user and login not triggered → show Landing
  if (!user && !showLogin) {
    return <Landing onLoginClick={() => setShowLogin(true)} />;
  }

  // 2️⃣ If no user but login clicked → show Login page
  if (!user && showLogin) {
    return <Login onLogin={handleLogin} />;
  }

  // 3️⃣ If logged in → show app
  return (
    <>
      <Navbar page={page} setPage={setPage} onLogout={handleLogout} />

      {page === "dashboard" && <Dashboard user={user} />}
      {page === "change" && <Change user={user} />}
      {page === "models" && <ModelSuggestion user={user} />}
      {page === "optimizer" && <PromptOptimizer user={user} />}
      {page === "batch" && <EnterpriseBatch />}
    </>
  );
}

export default App;

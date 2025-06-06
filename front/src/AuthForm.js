import React, { useState } from "react";
import { storeToken } from "./utils/jwtUtils";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        // Use the new token storage function with per-tab authentication
        storeToken(data.access_token, rememberMe);
        onAuth();
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors
            .map((err) => `${err.field}: ${err.errors}`)
            .join(", ");
          setError(errorMessages || "Auth failed");
        } else {
          setError(data.message || "Auth failed");
        }
      }
    } catch (err) {
      setError(
        "Network error - Make sure backend is running on localhost:3000"
      );
    }
  };
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        padding: 32,
        border: "1px solid #ddd",
        borderRadius: 12,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>
        🔐 {mode === "login" ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          <label
            htmlFor="rememberMe"
            style={{ cursor: "pointer", color: "#666" }}
          >
            Remember me across tabs
          </label>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "transparent",
          color: "#007bff",
          border: "1px solid #007bff",
          borderRadius: "6px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already have an account? Login"}
      </button>
      {error && (
        <div
          style={{
            color: "#dc3545",
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

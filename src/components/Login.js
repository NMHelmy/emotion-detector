import React, { useState, useEffect } from "react";
import axios from "axios";

function Login({ setView, setUsername, setLoggedInStatus, setFullName }) {
  const [localUsername, setLocalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function checkUsername(username) {
    if (username.length < 3) {
      setError("Username less than 3 characters");
    } else {
      setError("");
    }
  }

  function checkPassword(password) {
    if (password.length < 5) {
      setError("Password less than 5 characters");
    } else {
      setError("");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (localUsername === "" || password === "") {
      alert("Both Username and Password Are Required!");
      return;
    }

    if (error !== "") {
      alert("Username or Password are not meeting requirements needed");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/login", {
        username: localUsername,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      setUsername(localUsername);
      setLoggedInStatus(true);
      setFullName(response.data.full_name || localUsername); 
      setView("home");

      console.log("Server response:", response.data);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <h4 style={{ color: "red" }}>{error}</h4>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="username-form-input">Username:</label>
          <br />
          <input
            type="text"
            id="username-form-input"
            value={localUsername}
            placeholder="Username (must be 3+ characters long)"
            onChange={(e) => {
              setLocalUsername(e.target.value);
              checkUsername(e.target.value);
            }}
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => {
              setPassword(e.target.value);
              checkPassword(e.target.value);
            }}
          />
        </div>

        <button type="submit">Login</button>

        <a
          className="account-message"
          href="#"
          onClick={() => setView("signup")}
        >
          <p className="account-message">
            Don't have an account?{" "}
            <span className="account-action">Sign Up</span>
          </p>
        </a>
      </form>
    </div>
  );
}

export default Login;

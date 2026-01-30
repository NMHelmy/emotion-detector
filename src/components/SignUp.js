import React, { use, useState, useEffect } from "react";
import axios from "axios";

function SignUp({ setView }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function checkField(username, setError, fieldName) {
    if (username.length < 3) {
      setError(`${fieldName} less than 3 characters`);
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

    if (username === "" || password === "") {
      alert("Both Username and Password Are Required!");
      return;
    }

    if (error != "") {
      alert("Username or Password are not meeting requirements needed");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/signup", {
        username,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      setView("home");
      
      console.log("Server response:", response.data);
    } catch (err) {
      console.error("SignUp failed:", err);
      alert("SignUp failed.");
    }
  };

  return (
    <div className="login-container">
      <h2>SignUp</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="first-name-form-input">First Name:</label>
          <br />
          <input
            type="text"
            id="first-name-form-input"
            value={firstName}
            placeholder="First Name"
            onChange={(e) => {
              setFirstName(e.target.value);
              checkField(e.target.value, setFirstNameError, "First Name"); // Optional validation function
            }}
          />
        </div>
        <h4 style={{ color: "red" }}>{firstNameError}</h4>

        <div>
          <label htmlFor="last-name-form-input">Last Name:</label>
          <br />
          <input
            type="text"
            id="last-name-form-input"
            value={lastName}
            placeholder="Last Name"
            onChange={(e) => {
              setLastName(e.target.value);
              checkField(e.target.value, setLastNameError, "Last Name"); // Optional validation function
            }}
          />
        </div>
        <h4 style={{ color: "red" }}>{lastNameError}</h4>

        <div>
          <label htmlFor="username-form-input">Username:</label>
          <br />
          <input
            type="text"
            id="username-form-input"
            value={username}
            placeholder="Username (must be 3+ characters long)"
            onChange={(e) => {
              setUsername(e.target.value);
              checkField(e.target.value, setUsernameError, "User Name");
            }}
          />
        </div>
        <h4 style={{ color: "red" }}>{usernameError}</h4>

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
        <h4 style={{ color: "red" }}>{error}</h4>

        <button type="submit" onClick={handleSubmit}>
          SignUp
        </button>

        <a
          className="account-message"
          href="#"
          onClick={() => setView("login")}
        >
          <p className="account-message">
            Already have an account?{" "}
            <span className="account-action">Login</span>
          </p>
        </a>
      </form>
    </div>
  );
}

export default SignUp;

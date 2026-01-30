import React from "react";

function Header({
  setView,
  handleReset,
  loggedInStatus,
  setLoggedInStatus,
  setUsername,
  setFullName,
  setResult,
  setHistory, 
}) {
  return (
    <div className="header">
      <h1 className="title" onClick={handleReset} style={{ cursor: "pointer" }}>
        Emotion Detector
      </h1>

      <nav className="nav-links">
        <a href="#" onClick={handleReset}>
          Home
        </a>
        <a href="#" onClick={() => setView("history")}>
          History
        </a>
        <a href="#" onClick={() => setView("about")}>
          About Us
        </a>
        {!loggedInStatus && (
          <>
            <a className="btn-filled" href="#" onClick={() => setView("login")}>
              Login
            </a>
            <a
              className="btn-filled"
              href="#"
              onClick={() => setView("signup")}
            >
              Sign Up
            </a>
          </>
        )}
        {loggedInStatus && (
          <a
            className="btn-logout"
            href="#"
            onClick={() => {
              localStorage.removeItem("token");
              setLoggedInStatus(false);
              setUsername("");
              setFullName("");
              setView("home");
              setResult(null);
              setHistory([]); 
            }}
          >
            Logout
          </a>
        )}
      </nav>
    </div>
  );
}

export default Header;

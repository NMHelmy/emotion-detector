import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";
import History from "./components/History";
import About from "./components/About";
import WaveBackground from "./components/WaveBackground";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import axios from "axios";

function App() {
  const [view, setView] = useState("home");
  const [username, setUsername] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loggedInStatus, setLoggedInStatus] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleTryAgain = () => {
    setImageFile(null);
    setUsername("");
    setResult(null);
    setView("home");
  };

  useEffect(() => {
    if (view === "history") {
      const token = localStorage.getItem("token");
      axios
        .get("http://127.0.0.1:8000/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          // transform hex to image
          const mappedHistory = response.data.histories.map((entry) => {
            const byteArray = Uint8Array.from(
              entry.image.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
            );
            const base64 = btoa(String.fromCharCode(...byteArray));
            const imageUrl = `data:image/png;base64,${base64}`;

            return {
              imageUrl,
              emotion: entry.emotion,
              timestamp: entry.date,
            };
          });

          setHistory(mappedHistory);
        })
        .catch((error) => {
          console.error("Error fetching history:", error);
        });
    }
  }, [view]);

  const handleReset = () => {
    setUsername("");
    setImageFile(null);
    setResult(null);
    setView("home");
  };

  return (
    <div>
      <Header
        setView={setView}
        handleReset={handleReset}
        loggedInStatus={loggedInStatus}
        setLoggedInStatus={setLoggedInStatus}
        setUsername={setUsername}
        setFullName={setFullName}
        setResult={setResult}
        setHistory={setHistory}
      />
      {view == "home" && (
        <Home
          username={username}
          setUsername={setUsername}
          imageFile={imageFile}
          setImageFile={setImageFile}
          setResult={setResult}
          result={result}
          handleTryAgain={handleTryAgain}
          loggedInStatus={loggedInStatus}
          fullName={fullName}
        />
      )}

      {view === "history" &&
        (loggedInStatus ? (
          <History history={history} />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              fontSize: "18px",
              color: "#f44336",
            }}
          >
            Please log in to view your history.
          </div>
        ))}

      {view === "about" && <About />}

      {view == "signup" && <SignUp setView={setView} />}
      {view == "login" && (
        <Login
          setView={setView}
          setUsername={setUsername}
          setLoggedInStatus={setLoggedInStatus}
          setFullName={setFullName}
        />
      )}
      <WaveBackground />
    </div>
  );
}

export default App;

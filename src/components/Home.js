import React, { useRef, useState } from "react";
import axios from "axios";

function Home({
  username,
  setUsername,
  imageFile,
  setImageFile,
  setResult,
  result,
  handleTryAgain,
  loggedInStatus,
  fullName,
  setSubmitted,
  submitted,
}) {
  const fileInputRef = useRef();
  const [previewSrc, setPreviewSrc] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = username.trim();
    const isValidName = trimmed.length >= 3;

    if (!loggedInStatus) {
      if (!isValidName && !imageFile) {
        setErrorMsg("Please enter a valid name and upload an image.");
        return;
      }
      if (!isValidName) {
        setErrorMsg("Username must be at least 3 characters.");
        return;
      }
      if (!imageFile) {
        setErrorMsg("Please upload an image.");
        return;
      }
    } else if (!imageFile) {
      setErrorMsg("Please upload an image.");
      return;
    }

    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8000/analyze-image/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { emotion, confidence } = response.data;
      const emojiMap = {
        Angry: "😠",
        Disgusted: "🤢",
        Fear: "😨",
        Happy: "😊",
        Sad: "😢",
        Surprise: "😮",
        Neutral: "😐",
      };

      const emoji = emojiMap[emotion] || "😶";
      const displayName = loggedInStatus ? username : trimmed;

      setResult({
        label: `Hello ${displayName},`,
        text: `You look ${emotion.toUpperCase()} ${emoji}`,
        confidence,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  return (
    <>
      <div id="content">
        <p className="welcome">Welcome to Emotion Detector!</p>
        <p className="slogan">Upload a photo to detect emotions using AI.</p>
      </div>

      {!submitted && (
        <form id="username-form" onSubmit={handleSubmit}>
          <div className="username-input">
            {!loggedInStatus ? (
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={
                  username.length > 0 && username.length < 3
                    ? "input-error"
                    : ""
                }
              />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#e0e0e0",
                  fontSize: "18px",
                  margin: "10px auto",
                }}
              >
                Logged in as <strong>{fullName}</strong>
              </p>
            )}
            <button type="submit">Submit</button>
          </div>

          {errorMsg && <p id="form-error">{errorMsg}</p>}
        </form>
      )}

      <div id="upload-container">
        <form id="upload-form" onClick={handleImageClick}>
          <input
            type="file"
            id="upload-img"
            name="image"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <img
            src="/upload-icon.jpg"
            width="150"
            height="150"
            id="upload-trigger"
            alt="Upload Icon"
          />
          <p className="upload-text">Upload Image</p>
          <p className="submit-text">*Press submit after choosing image*</p>
        </form>
      </div>

      {(previewSrc || result) && (
        <>
          <div id="result-container" style={{ display: "flex" }}>
            {previewSrc && (
              <img
                id="preview-img"
                src={previewSrc}
                alt="Preview"
                style={{ display: "block" }}
              />
            )}
            {result && (
              <div className="emotion-output">
                <p id="emotion-label">{result.label}</p>
                <p id="emotion-text">{result.text}</p>
                {result.confidence && (
                  <p id="confidence-text">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </p>
                )}
              </div>
            )}
          </div>
          {result && (
            <button id="try-again-btn" onClick={handleTryAgain}>
              Try Another Image
            </button>
          )}
        </>
      )}
    </>
  );
}

export default Home;
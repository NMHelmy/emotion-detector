import React, { useEffect } from "react";

function History({ history }) {
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

  return (
    <section id="history-section">
      <h2 className="history-title">History</h2>
      <div className="history-container">
        <div className="history-header">
          <span>Image</span>
          <span>Emotion</span>
          <span>Time</span>
        </div>
        {history.map((item, index) => (
          <div key={index} className="history-item">
            <img src={item.imageUrl} alt="History" className="history-img" />
            <span>{item.emotion}</span>
            <span>{formatDate(item.timestamp)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default History;

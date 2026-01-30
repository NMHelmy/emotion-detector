import React, { useEffect } from "react";

function WaveBackground() {
  useEffect(() => {
    const wavePath = document.getElementById("wave-path");
    let offset = 0;

    function generateWavePath(offset) {
      const width = 1000;
      const height = 50;
      const amplitude = 20;
      const frequency = 0.02;
      const points = [];

      for (let x = 0; x <= width; x += 10) {
        const y = height + Math.sin((x + offset) * frequency) * amplitude;
        points.push(`${x},${y}`);
      }

      return "M" + points.join(" L ");
    }

    function animateWave() {
      offset += 2;
      if (wavePath) {
        wavePath.setAttribute("d", generateWavePath(offset));
        requestAnimationFrame(animateWave);
      }
    }

    animateWave();
  }, []);

  return (
    <div className="animated-wave-bg">
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path id="wave-path" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default WaveBackground;

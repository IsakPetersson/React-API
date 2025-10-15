import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Election from "./Election"; // Import the timer component

export default function NavBar() {
  const [mayor, setMayor] = useState(null);

  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/election")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mayor) {
          setMayor(data.mayor);
        }
      });
  }, []);

  // Gradient style for text
  const gradientTextStyle = {
    background:
      "linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-magenta) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    fontWeight: "bold",
    textAlign: "center",
  };

  return (
    <nav className="navbar-vertical">
      <h2>Hypixel Tracker</h2>
      <ul>
        <li>
          <Link to="/">Items</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
      <div style={{ marginTop: "auto", width: "100%" }}>
        <div
          style={{
            color: "#E732AA",
            fontWeight: "bold",
            fontSize: "1em",
          }}
        >
          {mayor ? (
            <>
              <div style={gradientTextStyle}>Mayor: {mayor.name}</div>
              <ul
                style={{
                  paddingLeft: "0",
                  margin: "8px auto 0 auto",
                  fontWeight: "normal",
                  fontSize: "0.8em",
                  color: "var(--text-secondary)",
                  width: "90%",
                  textAlign: "center",
                  display: "block",
                }}
              >
                {/* Election timer with gradient */}
                <li style={gradientTextStyle}>
                  <Election />
                </li>
                {mayor.perks.map((perk, idx) => (
                  <li key={idx} style={{ margin: "2px 0", textAlign: "center" }}>
                    {perk.name}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            "Loading mayor..."
          )}
        </div>
      </div>
    </nav>
  );
}

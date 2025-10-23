import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Election from "./Election";

export default function NavBar() {
  const [mayor, setMayor] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const isLoggedIn = !!userString;

  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/election")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mayor) {
          setMayor(data.mayor);
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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

  const tooltipStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "120%",
    background: "#222",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "0.85em",
    whiteSpace: "pre-line",
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    pointerEvents: "none",
  };

  function PerkItem({ perk }) {
    const [show, setShow] = useState(false);
    const cleanDescription = perk.description.replace(/§./g, "");

    return (
      <li
        style={{
          margin: "2px 0",
          textAlign: "center",
          position: "relative",
          cursor: "pointer",
          display: "inline-block",
          width: "100%",
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {perk.name}
        {show && (
          <div style={tooltipStyle}>
            <strong>{perk.name}</strong>
            <br />
            {cleanDescription}
          </div>
        )}
      </li>
    );
  }

  return (
    <>
      {/* Mobile burger button */}
      <button 
        className="burger-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Navigation */}
      <nav className={`navbar-vertical ${isMenuOpen ? 'mobile-open' : ''}`}>
        <h2>Hypixel Tracker</h2>
        <ul>
          <li>
            <Link to="/" onClick={closeMenu}>Items</Link>
          </li>
          <li>
            <Link to="/profiles" onClick={closeMenu}>Player Profiles</Link>
          </li>
          <li>
            {isLoggedIn ? (
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Logout
              </a>
            ) : (
              <Link to="/login" onClick={closeMenu}>Login</Link>
            )}
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
                  <li style={gradientTextStyle}>
                    <Election />
                  </li>
                  {mayor.perks.map((perk, idx) => (
                    <PerkItem key={idx} perk={perk} />
                  ))}
                </ul>
              </>
            ) : (
              "Loading mayor..."
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
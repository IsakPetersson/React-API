import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav
      style={{
        backgroundColor: "#222",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        width: "200px",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0" }}>Hypixel Tracker</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
        <li style={{ marginBottom: "15px" }}>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Items
          </Link>
        </li>
        <li style={{ marginBottom: "15px" }}>
          <Link to="/profiles" style={{ color: "#fff", textDecoration: "none" }}>
            Player Profiles
          </Link>
        </li>
        <li style={{ marginBottom: "15px" }}>
          <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}
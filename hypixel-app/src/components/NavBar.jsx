function NavBar() {
  return (
    <nav
      style={{
        backgroundColor: "#222",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column", // Make the navigation vertical
        alignItems: "flex-start", // Align items to the left
        height: "100vh", // Full height of the viewport
        position: "fixed", // Fix the navbar to the left
        top: 0,
        left: 0,
        width: "200px", // Set a fixed width for the navbar
      }}
    >
      <h2 style={{ margin: "0 0 20px 0" }}>Hypixel Tracker</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
        <li style={{ marginBottom: "15px" }}>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
        </li>
        <li style={{ marginBottom: "15px" }}>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>Login</a>
        </li>
        <li style={{ marginBottom: "15px" }}>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>Items</a>
        </li>
        <li>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>About</a>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;

import { Link } from "react-router-dom";

export default function NavBar() {
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
    </nav>
  );
}

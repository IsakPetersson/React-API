import { useEffect } from "react";
import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Profiles from "./pages/Profiles";
import Register from "./pages/Register";
import Tos from "./pages/Tos";
import "./bubbles.css"; // Import bubble styles

function App() {
  useEffect(() => {
    // Create floating bubbles
    const bubbleCount = 1000;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      document.body.appendChild(bubble);
    }

    // Cleanup function to remove bubbles when component unmounts
    return () => {
      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach(bubble => bubble.remove());
    };
  }, []);

  return (
    <div className="app-container">
      <NavBar />
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tos" element={<Tos />} />
      </Routes>
    </div>
  );
}

export default App;
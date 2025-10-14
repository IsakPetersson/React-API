import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tos from "./pages/Tos";

function App() {
  return (
    <div style={{ marginLeft: "200px" }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Items />} /> {/* Home page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/register" element={<Register />} /> {/* Register page */}
        <Route path="/tos" element={<Tos />} /> {/* Terms of Service page */}
      </Routes>
    </div>
  );
}

export default App;

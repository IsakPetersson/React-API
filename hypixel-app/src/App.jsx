import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Profiles from "./pages/Profiles";

function App() {
  return (
    <div style={{ marginLeft: "200px" }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Items />} /> {/* Home page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/profiles" element={<Profiles />} /> {/* Add this route */}
      </Routes>
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import ItemList from "./components/ItemList";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div style={{ marginLeft: "200px" }}> {/* Add margin to avoid overlap */}
      <NavBar />
      <div className="center-container">
        <div>
          <h1 className="text-center mb-4">Hypixel Skyblock Items</h1>
          <ItemList />
        </div>
      </div>
    </div>
  );
}

export default App;

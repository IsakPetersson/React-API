import { useEffect, useState } from "react";
import ItemList from "./components/ItemList";

function App() {
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Hypixel Skyblock Items</h1>
      <ItemList />
    </div>
  );
}

export default App;

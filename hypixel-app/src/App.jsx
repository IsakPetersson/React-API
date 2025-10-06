import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items); // API:t returnerar { success: true, items: [...] }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h1>Loading items...</h1>;

  return (
    
    <div style={{ padding: "20px" }}>
      <h1>Hypixel Skyblock Items</h1>
      <ul>
        {items.slice(0, 80).map((item, index) => (
          <li key={index}>
            <strong>{item.name}</strong> ({item.id})
            <br />
            {item.tier}
            <br />
            {item.category}
            <br />
            {item.material}
            <br />
            <br />
            <img
                src={`https://sky.shiiyu.moe/item/${encodeURIComponent(item.id)}`}
                alt={'${encodeURIComponent(item.name)}'}
                className="item-image"
                />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

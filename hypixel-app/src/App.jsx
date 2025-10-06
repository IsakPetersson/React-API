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
    <div className="container mt-4">
      <h1 className="text-center mb-4">Hypixel Skyblock Items</h1>
      <div className="row">
        {items.slice(0, 80).map((item, index) => (
          <div key={index} className="col-md-4 col-lg-3 mb-4">
            <div className="card h-100">
              <img
                src={`https://sky.shiiyu.moe/item/${encodeURIComponent(item.id)}`}
                className="card-img-top p-3"
                alt={item.id}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">
                  <strong>ID:</strong> {item.id}
                  <br />
                  <strong>Tier:</strong> {item.tier}
                  <br />
                  <strong>Category:</strong> {item.category}
                  <br />
                  <strong>Material:</strong> {item.material}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

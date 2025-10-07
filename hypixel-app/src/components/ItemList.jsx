import { useEffect, useState } from "react";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items); // API returns { success: true, items: [...] }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h1>Loading items...</h1>;

  return (
    <div className="row">
      {items.slice(0, 80).map((item, index) => (
        <div key={index} className="col-md-4 col-lg-3 mb-4"> {/* Adjusted col-lg-2 */}
          <div className="card h-100">
            <div className="cardtop">
              <img
                src={`./images/${item.material}.png`}
                className="card-img-top p-3"
                alt={item.id}
              />
            </div>
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text">
                <strong>ID:</strong> {item.id}
                <br />
                <strong>Rarity:</strong> {item.tier ? item.tier.charAt(0).toUpperCase() + item.tier.slice(1).toLowerCase() : "unknown"}
                <br />
                <strong>Category:</strong> {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : "unknown"}
                <br />
                <strong>Type:</strong> {item.material ? item.material
                  .toLowerCase()
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ') : "Unknown"} 
                <br />
                <strong>NPC Sell price:</strong> {item.npc_sell_price}:-
                <br />
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
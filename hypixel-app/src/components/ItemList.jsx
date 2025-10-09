import { useEffect, useState } from "react";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  // Fetch items fron Hypixel API
  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items); // API returns { success: true, items: [...] }
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
      });
  }, []);

  // Search bar filtering
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="itemsList">
      {/* Search Input */}
      <div className="searchItems mb-4 w-25 mx-auto">
        <input
          type="text"
          placeholder="Search items..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Item List */}
      <div className="row">
        {filteredItems.slice(0, 200).map((item, index) => (
          <div key={index} className="col-md-4 col-lg-3 mb-4">
            <div className="card h-100 border-0">
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
                  <strong>Rarity:</strong>{" "}
                  {item.tier
                    ? item.tier.charAt(0).toUpperCase() +
                      item.tier.slice(1).toLowerCase()
                    : "unknown"}
                  <br />
                  <strong>Category:</strong>{" "}
                  {item.category
                    ? item.category
                        .toLowerCase()
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "unknown"}
                  <br />
                  <strong>Type:</strong>{" "}
                  {item.material
                    ? item.material
                        .toLowerCase()
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "unknown"}
                  <br />
                  <strong>NPC Sell price:</strong> {item.npc_sell_price}:-
                  <br />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
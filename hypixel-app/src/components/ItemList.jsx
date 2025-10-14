import { useEffect, useMemo, useState } from "react";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [favBusy, setFavBusy] = useState(false);

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

  // Load user from localStorage and fetch their favorites
  useEffect(() => {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        const u = JSON.parse(uStr);
        setUser(u);
        // Fetch favorites from our API
        fetch(`/api/favorites?userId=${u.id}`)
          .then(r => r.json())
          .then(list => {
            const s = new Set(list.map(f => f.ItemId || f.itemId));
            setFavorites(s);
          })
          .catch(err => console.error('Failed to load favorites', err));
      }
    } catch (e) {
      console.warn('No user in localStorage');
    }
  }, []);

  // Search bar filtering
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFav = useMemo(() => (id) => favorites.has(id), [favorites]);

  async function toggleFavorite(item) {
    if (!user?.id) {
      alert('Please login to favorite items.');
      return;
    }
    const itemId = item.id;
    const itemName = item.name;
    const currentlyFav = favorites.has(itemId);
    setFavBusy(true);
    try {
      if (currentlyFav) {
        // Optimistic update
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, itemId })
        });
        if (!res.ok) throw new Error('Failed to remove favorite');
      } else {
        // Optimistic update
        setFavorites(prev => new Set(prev).add(itemId));
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, itemId, itemName })
        });
        if (!res.ok) throw new Error('Failed to add favorite');
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic update on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (currentlyFav) {
          // was fav, attempted to remove -> put back
          next.add(itemId);
        } else {
          // was not fav, attempted to add -> remove
          next.delete(itemId);
        }
        return next;
      });
      alert(e.message || 'Favorite action failed');
    } finally {
      setFavBusy(false);
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem('user');
    } catch {}
    setUser(null);
    setFavorites(new Set());
  }

  // Helper function to get color based on rarity
  const getRarityStyle = (tier) => {
    const rarityColors = {
      COMMON: "linear-gradient(90deg, #bababa, #e8e8e8)",
      UNCOMMON: "linear-gradient(90deg, #55FF55, #adffad)",
      RARE: "linear-gradient(90deg, #5555FF, #adadff)",
      EPIC: "linear-gradient(90deg, #AA00AA, #ffadff)",
      LEGENDARY: "linear-gradient(90deg, #FFAA00, #ffdead)",
      MYTHIC: "linear-gradient(90deg, #FF55FF, #ffadff)",
      DIVINE: "linear-gradient(90deg, #55FFFF, #adffff)",
      SPECIAL: "linear-gradient(90deg, #FF5555, #ffadad)",
      VERY_SPECIAL: "linear-gradient(90deg, #FF5555, #ffadad)",
    };
    const background = tier ? rarityColors[tier.toUpperCase()] : "linear-gradient(90deg, magenta, purple)";
    return { background };
  };

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

      {/* Auth status + Logout */}
      {user ? (
        <div className="mb-3 w-25 mx-auto d-flex justify-content-between align-items-center">
          <small className="text-muted">Logged in as {user.username}</small>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="mb-3 w-25 mx-auto text-center">
          <a href="/login" className="btn btn-sm btn-primary">Login</a>
        </div>
      )}

      {/* Item List */}
      <div className="row">
        {filteredItems.slice(0, 200).map((item, index) => (
          <div key={index} className="col-md-4 col-lg-3 mb-4">
            <div className="card h-100 border-0">
              <div className="cardtop" style={getRarityStyle(item.tier)}>
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
                <button
                  disabled={favBusy}
                  onClick={() => toggleFavorite(item)}
                  className={`btn ${isFav(item.id) ? 'btn-danger' : 'btn-outline-primary'} w-100`}
                  title={isFav(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFav(item.id) ? '★ Unfavorite' : '☆ Favorite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
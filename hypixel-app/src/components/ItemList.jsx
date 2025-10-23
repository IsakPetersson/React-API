import { useEffect, useMemo, useState } from "react";
import Filter from "./Filter";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [minecraftItems, setMinecraftItems] = useState(new Map()); // Store Minecraft API items
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [rarityFilter, setRarityFilter] = useState(""); // State for rarity filter
  const [categoryFilter, setCategoryFilter] = useState(""); // State for category filter
  const [typeFilter, setTypeFilter] = useState(""); // State for type filter
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // New state for favorites filter
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [favBusy, setFavBusy] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(100); // Start with 100 items

  // Fetch Minecraft items from the minecraft-api
  useEffect(() => {
    fetch("https://minecraft-api.vercel.app/api/items")
      .then((res) => res.json())
      .then((data) => {
        // Create a Map for quick lookup by namespacedId
        const itemMap = new Map();
        data.forEach(item => {
          // Convert namespacedId to match Hypixel format (e.g., "acacia_boat" -> "ACACIA_BOAT")
          const key = item.namespacedId.toUpperCase();
          itemMap.set(key, item);
        });
        setMinecraftItems(itemMap);
      })
      .catch((err) => {
        console.error("Error fetching Minecraft items:", err);
      });
  }, []);

  // Fetch items from Hypixel API
  useEffect(() => {
    fetch("https://api.hypixel.net/v2/resources/skyblock/items")
      .then((res) => res.json())
      .then((data) => {
        // Fisher-Yates shuffle to randomize the items array
        const shuffledItems = data.items;
        let currentIndex = shuffledItems.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          [shuffledItems[currentIndex], shuffledItems[randomIndex]] = [
            shuffledItems[randomIndex], shuffledItems[currentIndex]];
        }

        setItems(shuffledItems); // API returns { success: true, items: [...] }
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
      });
  }, []);

  // Load user from localStorage and fetch their favorites (server derives user from cookie)
  useEffect(() => {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        const u = JSON.parse(uStr);
        setUser(u);
        // Fetch favorites from our API (cookie-authenticated)
        fetch(`/api/favorites`, { credentials: 'include' })
          .then(r => r.ok ? r.json() : [])
          .then(list => {
            const s = new Set((list || []).map(f => f.ItemId || f.itemId));
            setFavorites(s);
          })
          .catch(err => console.error('Failed to load favorites', err));
      }
    } catch (e) {
      console.warn('No user in localStorage');
    }
  }, []);

  
  // Memoize filter options to prevent recalculation on every render
  const rarities = useMemo(() => {
    const rarityOrder = [
      'COMMON',
      'UNCOMMON',
      'RARE',
      'EPIC',
      'LEGENDARY',
      'MYTHIC',
      'DIVINE',
      'SPECIAL',
      'VERY_SPECIAL',
      'UNOBTAINABLE',
      'SUPREME'
    ];
    const uniqueRarities = [...new Set(items.map(item => item.tier).filter(Boolean))];
    return uniqueRarities.sort((a, b) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b));
  }, [items]);
  const categories = useMemo(() => [...new Set(items.map(item => item.category).filter(Boolean))].sort(), [items]);
  const types = useMemo(() => [...new Set(items.map(item => item.material).filter(Boolean))].sort(), [items]);

  // Search and filter logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const rarityMatch = !rarityFilter || item.tier === rarityFilter;
      const categoryMatch = !categoryFilter || item.category === categoryFilter;
      const typeMatch = !typeFilter || item.material === typeFilter;
      const favoriteMatch = !showFavoritesOnly || favorites.has(item.id); // Add favorites filter
      return nameMatch && rarityMatch && categoryMatch && typeMatch && favoriteMatch;
    });
  }, [items, searchTerm, rarityFilter, categoryFilter, typeFilter, showFavoritesOnly, favorites]);


  const isFav = useMemo(() => (id) => favorites.has(id), [favorites]);

  // Function to load more items
  const loadMoreItems = () => {
    setItemsToShow(prev => prev + 100); // Load 100 more items each time
  };

  async function toggleFavorite(item) {
    if (!user) {
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
          credentials: 'include',
          body: JSON.stringify({ itemId })
        });
        if (!res.ok) throw new Error('Failed to remove favorite');
      } else {
        // Optimistic update
        setFavorites(prev => new Set(prev).add(itemId));
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemId, itemName })
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
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .catch(() => {})
      .finally(() => {
        try { localStorage.removeItem('user'); } catch {}
        setUser(null);
        setFavorites(new Set());
      });
  }

  // Helper function to get GRADIENT color based on rarity
  const getRarityStyle = (tier) => {
    const rarityColors = {
      COMMON: "linear-gradient(90deg, #bababa, #e8e8e8)",
      UNCOMMON: "linear-gradient(90deg, #44cd44, #adffad)",
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

  // Helper function to get SOLID color for the rarity box
  const getRarityBoxStyle = (tier) => {
    const raritySolidColors = {
      COMMON: "#bababa",
      UNCOMMON: "#44cd44",
      RARE: "#5555FF",
      EPIC: "#AA00AA",
      LEGENDARY: "#FFAA00",
      MYTHIC: "#FF55FF",
      DIVINE: "#55FFFF",
      SPECIAL: "#FF5555",
      VERY_SPECIAL: "#FF5555",
    };
    const backgroundColor = tier ? raritySolidColors[tier.toUpperCase()] : "rgba(0, 0, 0, 0.5)";
    return { backgroundColor };
  };


 // Helper function to get the correct image source for an item
const getItemImageSrc = (item) => {
  // Check if it's a skull and has a skin property with a value
  if (item.material === 'SKULL_ITEM' && item.skin?.value) {
    try {
      // 1. Decode the Base64 value
      const decodedValue = atob(item.skin.value);
      const textureData = JSON.parse(decodedValue);

      // 2. Extract the texture URL (The most reliable data)
      const textureUrl = textureData.textures?.SKIN?.url;
      
      if (typeof textureUrl === 'string') {
        // 3. Extract the texture hash (the part after the last '/')
        const textureHash = textureUrl.substring(textureUrl.lastIndexOf('/') + 1);
        
        // 4. Use a service that accepts the TEXTURE HASH (not a UUID)
        return `https://mc-heads.net/head/${textureHash}`;
      }
      if (textureData.profileId) {
        return `https://crafatar.com/renders/head/${textureData.profileId}?overlay`;
      }
      
      // If no valid URL or profileId, fall back to the default skull
      return './images/SKULL_ITEM.png';
    } catch (e) {
      console.error("Failed to process skin for item:", item.id, e);
      return './images/SKULL_ITEM.png';
    }
  }
  
  // Try to find matching item in Minecraft API
  const materialKey = item.material?.toUpperCase();
  if (materialKey && minecraftItems.has(materialKey)) {
    return minecraftItems.get(materialKey).image;
  }
  
  // Default behavior for non-skull items
  return `./images/${item.material}.png`;
};


  return (
    <div className="itemsList">
      <h1 className="itemsListTitle mt-5">Browse All Items</h1>
      {/* Search and Filter Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mb-4">
        {/* Search Input */}
        <div className="searchItems">
          <input
            type="text"
            placeholder="Search items..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Component */}
        <Filter
          rarityFilter={rarityFilter}
          setRarityFilter={setRarityFilter}
          rarities={rarities}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          types={types}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          user={user}
        />
      </div>

      {/* Auth status + Logout 
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
        */}

      {/* Item List */}
      <div className="row g-3">
        {filteredItems.slice(0, itemsToShow).map((item, index) => (
          <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3">
            <div className="card h-100 border-0">
              <div className="cardtop" style={getRarityStyle(item.tier)}>
                <img
                  src={getItemImageSrc(item)}
                  className="card-img-top p-3"
                  alt={item.id}
                  style={{ imageRendering: 'pixelated' }} // Make pixelated images look crisp
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    // If any image fails to load, go straight to placeholder
                    e.target.src = './images/placeholder.png';
                  }}
                />
                <button
                  disabled={favBusy}
                  onClick={() => toggleFavorite(item)}
                  className={`btn fav-btn ${isFav(item.id) ? 'favorited' : 'btn-outline-light'}`}
                  title={isFav(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFav(item.id) ? '♥' : '♡'}
                </button>
                <div className="rarity-display" style={getRarityBoxStyle(item.tier)}>
                  <span className="rarity-text">
                    {item.tier ? item.tier.replace('_', ' ') : 'UNKNOWN'}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">
                  <strong>ID:</strong> {item.id}
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

      {/* Show More Button */}
      {itemsToShow < filteredItems.length && (
        <div className="text-center mt-4 mb-5">
          <button onClick={loadMoreItems} className="btn btn-primary show-more-btn">
            Show More Items ({filteredItems.length - itemsToShow} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
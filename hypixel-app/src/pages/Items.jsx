import ItemList from "../components/ItemList";

export default function Items() {
  return (
    <div className="center-container">
      <div className="hero-section">
        <h1 className="text-center mb-4 mainTitle">Skyblock Item Tracker</h1>
          <h2>Discover, search, and track over 1,000 Hypixel Skyblock Items. Find stats, rarities and prices in one comprehensive database.</h2>
      </div>
      <ItemList />
    </div>
  );
}

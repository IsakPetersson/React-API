import { useState } from 'react';

export default function Filter({
  rarityFilter,
  setRarityFilter,
  rarities,
  categoryFilter,
  setCategoryFilter,
  categories,
  typeFilter,
  setTypeFilter,
  types,
  showFavoritesOnly,
  setShowFavoritesOnly,
  user, // Add user prop to check if logged in
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatLabel = (label) => {
    if (!label) return '';
    return label
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="filter-container mb-4">
      <button className="btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>
        <i className="fa-solid fa-filter"></i> Filter
      </button>
      {isOpen && (
        <div className="filter-dropdown">
          {/* Show Favorites Only - Only visible when logged in */}
          {user && (
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="favoritesOnlyCheck"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="favoritesOnlyCheck">
                  Show Favorites Only
                </label>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Rarity</label>
            <select className="form-select" value={rarityFilter} onChange={e => setRarityFilter(e.target.value)} aria-label="Filter by Rarity">
              <option value="">All Rarities</option>
              {rarities.map(r => <option key={r} value={r}>{formatLabel(r)}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by Category">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Type</label>
            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by Type">
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
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
}) {
  const formatLabel = (label) => {
    if (!label) return '';
    return label
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="filter-group d-flex w-50">
      <select className="form-select me-2" value={rarityFilter} onChange={e => setRarityFilter(e.target.value)} aria-label="Filter by Rarity">
        <option value="">All Rarities</option>
        {rarities.map(r => <option key={r} value={r}>{formatLabel(r)}</option>)}
      </select>
      <select className="form-select me-2" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by Category">
        <option value="">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
      </select>
      <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by Type">
        <option value="">All Types</option>
        {types.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
      </select>
    </div>
  );
}
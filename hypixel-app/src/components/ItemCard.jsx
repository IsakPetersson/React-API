import React from 'react';

// Small presentational card for an item. Uses a small built-in filename map for known images
export default function ItemCard({ item, onClick }) {
  const filenameMap = {
    DIAMOND_SWORD: 'DIAMOND_SWORD.png',
    DIAMOND_PICKAXE: 'DIAMOND_SWORD.png',
    GOLDEN_APPLE: 'GOLDEN_APPLE.png',
    ENDER_PEARL: 'PRISMARINE_SHARD.png',
    BOW: 'DIAMOND_SWORD.png',
    ARROW: 'IRON_SWORD.png',
    DIAMOND: 'DIAMOND_SWORD.png',
    IRON_INGOT: 'IRON_SWORD.png',
    GOLD_INGOT: 'DIAMOND_SWORD.png',
    EMERALD: 'DIAMOND_SWORD.png',
  };

  const key = (item.material || item.id || item.name || '').toUpperCase();
  const imgFilename = filenameMap[key] || 'placeholder.png';

  // Build image path relative to the app's src images folder. Vite will handle these at runtime.
  // If the image is missing at runtime, the browser will show broken image; fallback CSS handles layout.
  const imgSrc = new URL(`../images/${imgFilename}`, import.meta.url).href;

  const displayName = item.display_name || item.name || item.id || item.material || 'Unknown Item';
  const count = item.count || item.amount || item.c || 1;
  const rarity = item.rarity || item.tier || null;

  return (
    <div className="card h-100 item-card" onClick={() => onClick && onClick(item)} style={{cursor: onClick ? 'pointer' : 'default'}}>
      <div className="card-body d-flex flex-column align-items-center p-2">
        <div style={{width: '64px', height: '64px', marginBottom: '6px'}}>
          <img src={imgSrc} alt={displayName} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>
        <div className="fw-semibold text-center" style={{fontSize: '0.85rem'}}>{displayName}</div>
        <div className="text-muted" style={{fontSize: '0.75rem'}}>{`x${count}`}</div>
        {rarity && (
          <div className="mt-1">
            <span className={`badge ${rarity === 'COMMON' ? 'bg-secondary' : rarity === 'UNCOMMON' ? 'bg-success' : rarity === 'RARE' ? 'bg-primary' : rarity === 'EPIC' ? 'bg-warning' : 'bg-info'}`} style={{fontSize: '0.65rem'}}>
              {rarity}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

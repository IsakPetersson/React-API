import { useState } from "react";
import pako from "pako";
import nbt from "prismarine-nbt";

export default function Players({ playerData }) {
  const [inventoryType, setInventoryType] = useState("inv_contents");

  // Updated inventory types based on API response
  const inventoryTypes = [
    { key: "inv_contents", name: "Main Inventory" },
    { key: "ender_chest_contents", name: "Ender Chest" },
    { key: "bag_contents", name: "Bag Contents" },
    { key: "inv_armor", name: "Armor" },
    { key: "equipment_contents", name: "Equipment" },
    { key: "personal_vault_contents", name: "Personal Vault" },
    { key: "wardrobe_equipped_slot", name: "Wardrobe Equipped Slot" },
    { key: "sacks_counts", name: "Sacks Counts" },
    { key: "wardrobe_contents", name: "Wardrobe Contents" }
  ];

  const renderInventory = (inventory) => {
    if (!inventory) {
      return (
        <div className="alert alert-warning">
          <p>No inventory data available for this type.</p>
        </div>
      );
    }
    
    // Check for different inventory data structures
    if (inventory.data) {
      // Base64 + Gzipped NBT data
      let decodedText = '';
      let nbtJson = null;
      try {
        // Decode base64 to Uint8Array
        const binaryString = atob(inventory.data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Decompress gzip
        const decompressed = pako.ungzip(bytes);
        // Parse NBT
        nbtJson = nbt.parse(decompressed.buffer).parsed;
        decodedText = JSON.stringify(nbtJson, null, 2);
      } catch (e) {
        decodedText = 'Failed to decode and parse NBT: ' + e.message;
      }
      return (
        <div>
          <div className="alert alert-success mb-3">
            <h6>✅ Inventory Data Found!</h6>
            <p>This inventory contains {inventory.data.length} characters of encoded data.</p>
            <p><strong>Data Type:</strong> {inventory.type || 'Unknown'}</p>
          </div>
          {/* Show decoded NBT as formatted JSON if possible */}
          <div className="card mb-3">
            <div className="card-header">
              <h6>Decoded Inventory Data (NBT)</h6>
            </div>
            <div className="card-body">
              <pre className="small" style={{maxHeight: '200px', overflow: 'auto', fontSize: '0.7rem'}}>{decodedText.substring(0, 5000)}</pre>
            </div>
          </div>
        </div>
      );
    } else if (inventory.items && Array.isArray(inventory.items)) {
      // Direct items array
      return (
        <div>
          <div className="alert alert-success mb-3">
            <h6>✅ Items Found!</h6>
            <p>This inventory contains {inventory.items.length} items.</p>
          </div>
          
          <div className="row">
            {inventory.items.map((item, index) => (
              <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
                <div className="card h-100">
                  <div className="card-body p-2">
                    <div className="fw-semibold" style={{fontSize: '0.9rem'}}>
                      {item.name || item.id || 'Unknown Item'}
                    </div>
                    <div className="text-muted" style={{fontSize: '0.8rem'}}>
                      x{item.count || item.amount || 1}
                    </div>
                    {item.rarity && (
                      <span className={`badge badge-sm ${
                        item.rarity === 'COMMON' ? 'bg-secondary' :
                        item.rarity === 'UNCOMMON' ? 'bg-success' :
                        item.rarity === 'RARE' ? 'bg-primary' :
                        item.rarity === 'EPIC' ? 'bg-warning' : 'bg-info'
                      }`} style={{fontSize: '0.7rem'}}>
                        {item.rarity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Attempt to display contents of all fields
      return (
        <div className="alert alert-info">
          <h6>Inventory Data Structure</h6>
          <p>This inventory has a different data structure than expected.</p>
          <p><strong>Available fields:</strong> {Object.keys(inventory).join(', ')}</p>
          <div className="mt-3">
            {Object.entries(inventory).map(([key, value]) => (
              <div key={key} className="mb-3">
                <h6 className="small">{key}</h6>
                {Array.isArray(value) ? (
                  <ul className="small">
                    {value.map((item, idx) => (
                      <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                    ))}
                  </ul>
                ) : typeof value === 'object' && value !== null ? (
                  <pre className="small" style={{maxHeight: '150px', overflow: 'auto', fontSize: '0.7rem'}}>{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <span className="small">{String(value)}</span>
                )}
              </div>
            ))}
          </div>
          <details className="mt-3">
            <summary className="btn btn-sm btn-outline-info">Show Raw Inventory Data</summary>
            <pre className="mt-2 small" style={{maxHeight: '200px', overflow: 'auto', fontSize: '0.7rem'}}>
              {JSON.stringify(inventory, null, 2)}
            </pre>
          </details>
        </div>
      );
    }
  };

  const renderSkyblockInventory = (profile) => {
    // Check if we have members data (inventory is stored in members)
    const members = profile.members;
    const memberKeys = members ? Object.keys(members) : [];
    
    // ...existing code...

    // If we have members, show member selection and their inventories
    if (memberKeys.length > 0) {
      // Get available inventory types for the first member
      const firstMember = members[memberKeys[0]];
      const availableTypes = Object.keys(firstMember);
      // Use available types for selector
      return (
        <div>
          <div className="alert alert-success mb-3">
            <h6>👥 Profile Members Found ({memberKeys.length})</h6>
            <p>Inventory data is stored in profile members. Here's what each member has:</p>
          </div>
          <div className="row">
            {memberKeys.map((memberId, index) => {
              const member = members[memberId];
              const memberAvailableTypes = Object.keys(member);
              return (
                <div key={memberId} className="col-md-6 col-lg-4 mb-3">
                  <div className="card">
                    <div className="card-header">
                      <h6>Member {index + 1}</h6>
                      <small className="text-muted">UUID: {memberId.substring(0, 8)}...</small>
                    </div>
                    <div className="card-body">
                      <p className="small">Last Save: {member.last_save ? new Date(member.last_save).toLocaleString() : 'Unknown'}</p>
                      <div className="mt-2">
                        <h6 className="small">Available Inventories:</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {memberAvailableTypes.map(typeKey => (
                            <span key={typeKey} className="badge bg-success">{typeKey}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="form-label small">Select inventory for this member:</label>
                        <select 
                          className="form-select form-select-sm"
                          onChange={(e) => {
                            const selectedType = e.target.value;
                            if (selectedType && member[selectedType]) {
                              setInventoryType(selectedType);
                            }
                          }}
                        >
                          <option value="">Choose inventory type...</option>
                          {memberAvailableTypes.map(typeKey => (
                            <option key={typeKey} value={typeKey}>
                              {typeKey}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Show detailed inventory for the first member */}
          {memberKeys.length > 0 && (
            <div className="mt-4">
              <div className="card">
                <div className="card-header">
                  <h6>📦 Detailed Inventory for First Member</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="inventoryType" className="form-label">Select Inventory Type:</label>
                    <select 
                      className="form-select" 
                      id="inventoryType"
                      value={inventoryType}
                      onChange={(e) => setInventoryType(e.target.value)}
                    >
                      {availableTypes.map(typeKey => (
                        <option key={typeKey} value={typeKey}>{typeKey}</option>
                      ))}
                    </select>
                  </div>
                  {firstMember[inventoryType] ? (
                    renderInventory(firstMember[inventoryType])
                  ) : (
                    <div className="alert alert-warning">
                      <p>No {inventoryType} data available for this member.</p>
                      <p className="mb-0 small">Available inventory types: {availableTypes.join(', ') || 'None'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // No members found - show profile-level inventory or explain
    return (
      <div>
        <div className="alert alert-info mb-3">
          <h6>📋 Profile Structure</h6>
          <p>This profile doesn't have member data. Inventory data is typically stored in profile members.</p>
        </div>
        
        <div className="mb-3">
          <label htmlFor="inventoryType" className="form-label">Select Inventory Type:</label>
          <select 
            className="form-select" 
            id="inventoryType"
            value={inventoryType}
            onChange={(e) => setInventoryType(e.target.value)}
          >
            {inventoryTypes.map(type => (
              <option key={type.key} value={type.key}>{type.name}</option>
            ))}
          </select>
        </div>

        {profile[inventoryType] ? (
          renderInventory(profile[inventoryType])
        ) : (
          <div className="alert alert-warning">
            <p>No {inventoryTypes.find(t => t.key === inventoryType)?.name} data available for this profile.</p>
            <p className="mb-0 small">Available inventory types: {Object.keys(profile).filter(key => key.includes('inv') || key.includes('bag') || key.includes('chest')).join(', ') || 'None'}</p>
            
            <div className="mt-2">
              <h6>Why no inventory data?</h6>
              <ul className="small mb-0">
                <li>The player may have <strong>inventory API disabled</strong> in their Hypixel settings</li>
                <li>This profile might be <strong>new or inactive</strong> with no inventory data</li>
                <li>The player might be using <strong>private inventory settings</strong></li>
                <li>Some profiles don't store inventory data in the API</li>
              </ul>
            </div>
            
            {/* Show what data is actually available */}
            <div className="mt-3">
              <details>
                <summary className="btn btn-sm btn-outline-info">Show Available Profile Data</summary>
                <div className="mt-2">
                  <p className="small text-muted mb-2">Profile contains these fields:</p>
                  <div className="row">
                    {Object.keys(profile).map((key, index) => (
                      <div key={index} className="col-6 col-md-4 col-lg-3 mb-1">
                        <span className="badge bg-light text-dark border">{key}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Show some basic profile info */}
                  <div className="mt-3">
                    <h6>Profile Summary:</h6>
                    <ul className="small">
                      <li><strong>Profile ID:</strong> {profile.profile_id || 'Unknown'}</li>
                      <li><strong>Created:</strong> {profile.created_at ? new Date(profile.created_at).toLocaleString() : 'Unknown'}</li>
                      <li><strong>Members:</strong> {profile.members ? Object.keys(profile.members).length : 0}</li>
                      <li><strong>Community Upgrades:</strong> {profile.community_upgrades ? 'Available' : 'None'}</li>
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="mb-0">
          {playerData.ign}'s Skyblock Inventory
          <span className="badge bg-info ms-2">{playerData.profileName}</span>
        </h4>
      </div>
      
      <div className="card-body">
        <h6>Skyblock Inventory</h6>
        {playerData.profile ? (
          renderSkyblockInventory(playerData.profile)
        ) : (
          <p>No Skyblock profile data available.</p>
        )}
        
        {playerData.profile && (
          <div className="mt-4">
            <h6>Profile Info</h6>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Profile Name:</strong> {playerData.profile.cute_name || playerData.profileName || 'Unknown'}</p>
                <p><strong>Last Save:</strong> {
                  playerData.profile.last_save 
                    ? new Date(playerData.profile.last_save).toLocaleString() 
                    : 'No data available'
                }</p>
              </div>
              <div className="col-md-6">
                <p><strong>Coins:</strong> {playerData.profile.coin_purse || 0}</p>
                <p><strong>Bank Balance:</strong> {playerData.profile.banking?.balance || 0}</p>
              </div>
            </div>
            
            {/* Debug info - remove in production */}
            <div className="mt-3">
              <details>
                <summary className="text-muted small">Debug Info (click to expand)</summary>
                <pre className="small text-muted mt-2" style={{fontSize: '0.8em', maxHeight: '200px', overflow: 'auto'}}>
                  {JSON.stringify(playerData.profile, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import ItemCard from "./ItemCard";

export default function Players({ playerData }) {
  const [inventoryType, setInventoryType] = useState("inv_contents");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionChild, setSelectedSectionChild] = useState(null);
  const [selectedInventoryField, setSelectedInventoryField] = useState(null);
  const [selectedInventoryChild, setSelectedInventoryChild] = useState(null);

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
      // Inventory may be base64-encoded JSON or NBT. We'll try a safe base64 -> JSON decode first
      let decodedText = '';
      let parsed = null;
      try {
        const binaryString = atob(inventory.data);
        // Try to parse as JSON directly
        try {
          parsed = JSON.parse(binaryString);
          decodedText = JSON.stringify(parsed, null, 2);
        } catch (e) {
          // If JSON parse failed, show truncated base64-decoded text for inspection
          decodedText = binaryString.substring(0, 5000);
        }
      } catch (e) {
        decodedText = 'Failed to base64-decode inventory data: ' + e.message;
      }

      return (
        <div>
          <div className="alert alert-success mb-3">
            <h6>✅ Encoded Inventory Data Found</h6>
            <p>This inventory contains {inventory.data.length} characters of encoded data.</p>
            <p><strong>Data Type:</strong> {inventory.type || 'Unknown'}</p>
          </div>
          <div className="card mb-3">
            <div className="card-header">
              <h6>Decoded Inventory Preview</h6>
            </div>
            <div className="card-body">
              {parsed && parsed.items && Array.isArray(parsed.items) ? (
                <div>
                  <div className="row">
                    {parsed.items.map((it, i) => (
                      <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
                        <ItemCard item={it} onClick={() => setSelectedItem(it)} />
                      </div>
                    ))}
                  </div>
                  {selectedItem && (
                    <div className="card mt-3">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>Selected Item</strong>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedItem(null)}>Close</button>
                      </div>
                      <div className="card-body">
                        <pre className="small" style={{maxHeight: '300px', overflow: 'auto'}}>{JSON.stringify(selectedItem, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <pre className="small" style={{maxHeight: '300px', overflow: 'auto'}}>{decodedText}</pre>
              )}
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
                <ItemCard item={item} onClick={() => setSelectedItem(item)} />
              </div>
            ))}
          </div>
          {selectedItem && (
            <div className="card mt-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Selected Item</strong>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedItem(null)}>Close</button>
              </div>
              <div className="card-body">
                <pre className="small" style={{maxHeight: '300px', overflow: 'auto'}}>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Attempt to display contents of all fields — render as cards instead of raw JSON
      const invFields = Object.keys(inventory || {});

      return (
        <div>
          <div className="alert alert-info mb-3">
            <h6>Inventory Data Structure</h6>
            <p>This inventory has a different data structure than expected.</p>
            <p><strong>Available fields:</strong> {invFields.join(', ')}</p>
          </div>

          <div className="row">
            {invFields.map((field) => {
              const val = inventory[field];
              const isEmpty = val && typeof val === 'object' && Object.keys(val).length === 0;
              const summary = Array.isArray(val) ? `${val.length} entries` : (val && typeof val === 'object' ? `${Object.keys(val).length} keys` : String(val));
              return (
                <div key={field} className="col-6 col-md-4 col-lg-3 mb-3">
                  <div className="card h-100" style={{cursor: 'pointer'}} onClick={() => { setSelectedInventoryField(field === selectedInventoryField ? null : field); setSelectedInventoryChild(null); }}>
                    <div className="card-body d-flex flex-column align-items-center">
                      <div style={{width: '72px', height: '72px'}}>
                        <img src={new URL(`../images/placeholder.png`, import.meta.url).href} alt={field} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                      </div>
                      <div className="fw-semibold mt-2">{field}</div>
                      <div className="text-muted small">{isEmpty ? 'Empty' : summary}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedInventoryField && (
            <div className="card mt-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>{selectedInventoryField}</strong>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedInventoryField(null); setSelectedInventoryChild(null); }}>Close</button>
              </div>
              <div className="card-body">
                {(() => {
                  const sectionValue = inventory[selectedInventoryField];
                  if (sectionValue == null) return <div className="text-muted">No data</div>;

                  if (Array.isArray(sectionValue)) {
                    return (
                      <div className="row">
                        {sectionValue.map((it, i) => (
                          <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
                            <ItemCard item={typeof it === 'object' ? it : { name: String(it) }} onClick={() => setSelectedInventoryChild(i)} />
                          </div>
                        ))}
                        {selectedInventoryChild !== null && (
                          <div className="col-12 mt-3">
                            <div className="card">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                <strong>Entry {selectedInventoryChild}</strong>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInventoryChild(null)}>Close</button>
                              </div>
                              <div className="card-body">
                                <pre className="small" style={{maxHeight: '400px', overflow: 'auto'}}>{JSON.stringify(sectionValue[selectedInventoryChild], null, 2)}</pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (typeof sectionValue === 'object') {
                    const childKeys = Object.keys(sectionValue);
                    if (childKeys.length === 0) return <div className="text-muted">Empty</div>;

                    return (
                      <div className="row">
                        <div className="col-lg-8">
                          <div className="row">
                            {childKeys.map((childKey) => (
                              <div key={childKey} className="col-6 col-md-4 mb-3">
                                <div className={`card h-100 ${selectedInventoryChild === childKey ? 'border-primary' : ''}`} style={{cursor: 'pointer'}} onClick={() => setSelectedInventoryChild(childKey)}>
                                  <div className="card-body">
                                    <div className="fw-semibold">{childKey}</div>
                                    <div className="text-muted small">{Array.isArray(sectionValue[childKey]) ? `${sectionValue[childKey].length} items` : (sectionValue[childKey] && typeof sectionValue[childKey] === 'object' ? `${Object.keys(sectionValue[childKey]).length} keys` : String(sectionValue[childKey]))}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-lg-4 mt-3 mt-lg-0">
                          {selectedInventoryChild ? (
                            <div className="card h-100">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                <strong>{selectedInventoryChild}</strong>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInventoryChild(null)}>Close</button>
                              </div>
                              <div className="card-body">
                                {(() => {
                                  const v = sectionValue[selectedInventoryChild];
                                  if (v == null) return <div className="text-muted">No data</div>;
                                  if (Array.isArray(v)) {
                                    return (
                                      <div>
                                        <h6 className="small">Array ({v.length})</h6>
                                        <ul className="small">
                                          {v.map((it, idx) => <li key={idx}>{typeof it === 'object' ? JSON.stringify(it) : String(it)}</li>)}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  if (typeof v === 'object') {
                                    return (
                                      <div>
                                        {Object.entries(v).map(([k, val]) => (
                                          <div key={k} className="mb-2">
                                            <div className="small text-muted">{k}</div>
                                            <div className="small">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return <div className="small">{String(v)}</div>;
                                })()}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted small">Select a child to view details</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return <pre className="small" style={{maxHeight: '400px', overflow: 'auto'}}>{JSON.stringify(sectionValue, null, 2)}</pre>;
                })()}
              </div>
            </div>
          )}
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
                  {/* Automatically pick the first available inventory type for this member (dropdown removed) */}
                  {(() => {
                    const displayType = availableTypes.includes(inventoryType) ? inventoryType : (availableTypes[0] || inventoryType);
                    return (
                      <div>
                        <p className="small text-muted">Showing inventory type: <strong>{displayType}</strong></p>
                        {firstMember[displayType] ? (
                          renderInventory(firstMember[displayType])
                        ) : (
                          <div className="alert alert-warning">
                            <p>No {displayType} data available for this member.</p>
                            <p className="mb-0 small">Available inventory types: {availableTypes.join(', ') || 'None'}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

  // No members found - show profile-level sections as cards (not plain text)
  // We'll present each top-level field as a card with a small image and allow expanding to view details
  const fields = Object.keys(profile);

    const sectionImageMap = {
      village_plaza: 'DIAMOND_SWORD.png',
      wither_cage: 'DIAMOND_SWORD.png',
      black_lagoon: 'DIAMOND_SWORD.png',
      dead_cats: 'DIAMOND_SWORD.png',
      wizard_tower: 'DIAMOND_SWORD.png',
      enigma: 'DIAMOND_SWORD.png',
      gallery: 'DIAMOND_SWORD.png',
      west_village: 'DIAMOND_SWORD.png',
      wyld_woods: 'DIAMOND_SWORD.png',
      castle: 'DIAMOND_SWORD.png',
      access: 'PAPER.png',
      dreadfarm: 'DIAMOND_SWORD.png'
    };

    return (
      <div>
        <div className="alert alert-info mb-3">
          <h6>📋 Profile Sections</h6>
          <p>Click a section to view its details visually.</p>
        </div>

        <div className="row">
          {fields.map((field) => {
            const img = sectionImageMap[field] || 'placeholder.png';
            const imgSrc = new URL(`../images/${img}`, import.meta.url).href;
            const value = profile[field];
            const isEmpty = value && Object.keys(value).length === 0;
            return (
              <div key={field} className="col-6 col-md-4 col-lg-3 mb-3">
                <div className="card h-100" style={{cursor: 'pointer'}} onClick={() => { setSelectedSection(field === selectedSection ? null : field); setSelectedSectionChild(null); }}>
                  <div className="card-body d-flex flex-column align-items-center">
                    <div style={{width: '72px', height: '72px'}}>
                      <img src={imgSrc} alt={field} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                    </div>
                    <div className="fw-semibold mt-2">{field}</div>
                    <div className="text-muted small">{isEmpty ? 'Empty' : Array.isArray(value) ? `${value.length} entries` : Object.keys(value).length + ' keys'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedSection && (
          <div className="card mt-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>{selectedSection}</strong>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedSection(null); setSelectedSectionChild(null); }}>Close</button>
            </div>
            <div className="card-body">
              {(() => {
                const sectionValue = profile[selectedSection];
                if (sectionValue == null) return <div className="text-muted">No data</div>;

                // If it's an array of items, attempt to render as item cards
                if (Array.isArray(sectionValue)) {
                  return (
                    <div className="row">
                      {sectionValue.map((it, i) => (
                        <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
                          <ItemCard item={typeof it === 'object' ? it : { name: String(it) }} onClick={() => setSelectedSectionChild(i)} />
                        </div>
                      ))}
                      {selectedSectionChild !== null && (
                        <div className="col-12 mt-3">
                          <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <strong>Entry {selectedSectionChild}</strong>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedSectionChild(null)}>Close</button>
                            </div>
                            <div className="card-body">
                              <pre className="small" style={{maxHeight: '400px', overflow: 'auto'}}>{JSON.stringify(sectionValue[selectedSectionChild], null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // If it's an object, render child keys as cards
                if (typeof sectionValue === 'object') {
                  const childKeys = Object.keys(sectionValue);
                  if (childKeys.length === 0) return <div className="text-muted">Empty</div>;

                  return (
                    <div className="row">
                      <div className="col-lg-8">
                        <div className="row">
                          {childKeys.map((childKey) => {
                            const childVal = sectionValue[childKey];
                            const summary = Array.isArray(childVal) ? `${childVal.length} items` : (childVal && typeof childVal === 'object' ? `${Object.keys(childVal).length} keys` : String(childVal));
                            return (
                              <div key={childKey} className="col-6 col-md-4 mb-3">
                                <div className={`card h-100 ${selectedSectionChild === childKey ? 'border-primary' : ''}`} style={{cursor: 'pointer'}} onClick={() => setSelectedSectionChild(childKey)}>
                                  <div className="card-body">
                                    <div className="fw-semibold">{childKey}</div>
                                    <div className="text-muted small">{summary}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="col-lg-4 mt-3 mt-lg-0">
                        {selectedSectionChild ? (
                          <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <strong>{selectedSectionChild}</strong>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedSectionChild(null)}>Close</button>
                            </div>
                            <div className="card-body">
                              {(() => {
                                const v = sectionValue[selectedSectionChild];
                                if (v == null) return <div className="text-muted">No data</div>;
                                if (Array.isArray(v)) {
                                  return (
                                    <div>
                                      <h6 className="small">Array ({v.length})</h6>
                                      <ul className="small">
                                        {v.map((it, idx) => <li key={idx}>{typeof it === 'object' ? JSON.stringify(it) : String(it)}</li>)}
                                      </ul>
                                    </div>
                                  );
                                }
                                if (typeof v === 'object') {
                                  return (
                                    <div>
                                      {Object.entries(v).map(([k, val]) => (
                                        <div key={k} className="mb-2">
                                          <div className="small text-muted">{k}</div>
                                          <div className="small">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return <div className="small">{String(v)}</div>;
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted small">Select a child to view details</div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Fallback: show raw JSON
                return <pre className="small" style={{maxHeight: '400px', overflow: 'auto'}}>{JSON.stringify(sectionValue, null, 2)}</pre>;
              })()}
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